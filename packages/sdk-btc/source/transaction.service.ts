import { BIP32 } from "@payvo/cryptography";
import { Contracts, Exceptions, IoC, Services } from "@payvo/sdk";
import * as bitcoin from "bitcoinjs-lib";
import { BIP32Interface } from "bitcoinjs-lib";
import coinSelect from "coinselect";

import { getNetworkConfig } from "./config";
import { BindingType } from "./constants";
import { addressesAndSigningKeysGenerator, SigningKeys } from "./transaction.domain";
import { AddressFactory, BipLevel, Levels } from "./address.factory";
import { UnspentTransaction } from "./contracts";
import { getAddresses, getDerivationMethod, post } from "./helpers";
import { BigNumber } from "@payvo/helpers";

@IoC.injectable()
export class TransactionService extends Services.AbstractTransactionService {
	@IoC.inject(BindingType.AddressFactory)
	private readonly addressFactory!: AddressFactory;

	@IoC.inject(IoC.BindingType.AddressService)
	private readonly addressService!: Services.AddressService;

	@IoC.inject(IoC.BindingType.FeeService)
	private readonly feeService!: Services.FeeService;

	public override async transfer(input: Services.TransferInput): Promise<Contracts.SignedTransactionData> {
		if (input.signatory.signingKey() === undefined) {
			throw new Exceptions.MissingArgument(this.constructor.name, this.transfer.name, "input.signatory");
		}

		const identityOptions = input.signatory.options();
		if (identityOptions === undefined) {
			throw new Exceptions.Exception(
				"Invalid bip level requested. A valid level is required: bip44, bip49 or bip84",
			);
		}

		if (
			identityOptions.bip44 === undefined &&
			identityOptions.bip49 === undefined &&
			identityOptions.bip84 === undefined
		) {
			throw new Exceptions.Exception(
				"Invalid bip level requested. A valid level is required: bip44, bip49 or bip84",
			);
		}

		const levels = this.addressFactory.getLevel(identityOptions);

		try {
			if (input.signatory.actsWithMnemonic()) {
				console.log(input.signatory.signingKey());
			}
			const network = getNetworkConfig(this.configRepository);

			// 1. Derive the sender address (corresponding to first address index for the wallet)
			const { address, type, path } = await this.addressService.fromMnemonic(
				input.signatory.signingKey(),
				identityOptions,
			);
			console.log(type, address, path);

			// 3. Compute the amount to be transferred
			const amount = this.toSatoshi(input.data.amount).toNumber();

			// 4. Add utxos
			const accountKey = BIP32.fromMnemonic(input.signatory.signingKey(), network)
				.deriveHardened(levels.purpose)
				.deriveHardened(levels.coinType)
				.deriveHardened(levels.account || 0);

			console.log("accountKey", accountKey.toBase58(), accountKey.neutered().toBase58());

			const targets = [
				{
					address: input.data.to,
					value: amount,
				},
			];

			const psbt = new bitcoin.Psbt({ network: network });

			await this.#addUtxos(psbt, levels, accountKey, targets, address, input);

			const transaction: bitcoin.Transaction = psbt.extractTransaction();

			return this.dataTransferObjectService.signedTransaction(
				transaction.getId(),
				{
					sender: address,
					recipient: input.data.to,
					amount: amount,
					fee: psbt.getFee(),
					timestamp: new Date(), // TODO See if we have a proper timestamp inside the built transaction
				},
				transaction.toHex(),
			);
		} catch (error) {
			console.log(error);
			throw new Exceptions.CryptoException(error as any);
		}
	}

	async #addUtxos(
		psbt,
		levels: Levels,
		accountKey: BIP32Interface,
		targets,
		changeAddress,
		input: Services.TransferInput,
	): Promise<void> {
		let feeRate: number | undefined = input.fee;

		if (!feeRate) {
			feeRate = (await this.feeService.all()).transfer.avg.toNumber();
		}

		const method = this.#addressingSchema(levels);
		const id: Services.WalletIdentifier = {
			type: "extendedPublicKey",
			value: accountKey.neutered().toBase58(),
			method: method,
		};

		const allUnspentTransactionOutputs = await this.unspentTransactionOutputs(id);
		console.log("allUnspentTransactionOutputs", allUnspentTransactionOutputs);

		const derivationMethod = getDerivationMethod(id);

		let utxos = allUnspentTransactionOutputs.map((utxo) => {
			let signingKeysGenerator = addressesAndSigningKeysGenerator(derivationMethod, accountKey);
			let signingKey: SigningKeys | undefined = undefined;

			do {
				const addressAndSigningKey: SigningKeys = signingKeysGenerator.next().value;
				if (addressAndSigningKey.address === utxo.address) {
					signingKey = addressAndSigningKey;
				}
			} while (signingKey === undefined);

			let extra;
			if (levels.purpose === 44) {
				extra = {
					nonWitnessUtxo: Buffer.from(utxo.raw, "hex"),
				};
			} else if (levels.purpose === 49) {
				let network = getNetworkConfig(this.configRepository);

				const payment = bitcoin.payments.p2sh({
					redeem: bitcoin.payments.p2wpkh({
						pubkey: Buffer.from(signingKey.publicKey, "hex"),
						network,
					}),
					network,
				});

				if (!payment.redeem) {
					throw new Error("The [payment.redeem] property is empty. This looks like a bug.");
				}

				extra = {
					witnessUtxo: {
						script: Buffer.from(utxo.script, "hex"),
						value: utxo.satoshis,
					},
					redeemScript: payment.redeem.output,
				};
			} else if (levels.purpose === 84) {
				extra = {
					witnessUtxo: {
						script: Buffer.from(utxo.script, "hex"),
						value: utxo.satoshis,
					},
				};
			}

			return {
				address: utxo.address,
				txId: utxo.txId,
				vout: utxo.outputIndex,
				value: utxo.satoshis,
				signingKey: Buffer.from(signingKey.privateKey, "hex"),
				...extra,
			};
		});

		const { inputs, outputs, fee } = coinSelect(utxos, targets, feeRate);
		console.log("inputs", inputs);
		console.log("outputs", outputs);
		console.log("fee", fee);

		if (!inputs || !outputs) {
			throw new Error("Cannot determine utxos for this transaction");
		}

		inputs.forEach((input) => {
			return psbt.addInput({
				hash: input.txId,
				index: input.vout,
				...input,
			});
		});
		outputs.forEach((output) => {
			// watch out, outputs may have been added that you need to provide
			// an output address/script for
			if (!output.address) {
				output.address = changeAddress; // @TODO Derive and use fresh change addresses wallet.getChangeAddress()
				// wallet.nextChangeAddress()
			}

			psbt.addOutput({
				address: output.address,
				value: output.value,
			});
		});

		inputs.forEach((input, index) => psbt.signInput(index, bitcoin.ECPair.fromPrivateKey(input.signingKey)));

		psbt.validateSignaturesOfAllInputs();
		psbt.finalizeAllInputs();
	}

	#addressingSchema(levels: Levels): BipLevel {
		if (levels.purpose === 44) {
			return "bip44";
		}

		if (levels.purpose === 49) {
			return "bip49";
		}

		if (levels.purpose === 84) {
			return "bip84";
		}

		throw new Exceptions.Exception(`Invalid level specified: ${levels.purpose}`);
	}

	private async unspentTransactionOutputs(id: Services.WalletIdentifier): Promise<UnspentTransaction[]> {
		const addresses = await getAddresses(id, this.httpClient, this.configRepository);

		const utxos = (
			await post(`wallets/transactions/unspent`, { addresses }, this.httpClient, this.configRepository)
		).data;

		const rawTxs = (
			await post(
				`wallets/transactions/raw`,
				{ transaction_ids: utxos.map((utxo) => utxo.txId) },
				this.httpClient,
				this.configRepository,
			)
		).data;

		return utxos.map((utxo) => ({
			...utxo,
			raw: rawTxs[utxo.txId],
		}));
	}
}
