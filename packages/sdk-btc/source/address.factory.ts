import { Coins, Exceptions, IoC, Services } from "@payvo/sdk";
import { BIP44 } from "@payvo/cryptography";
import * as bitcoin from "bitcoinjs-lib";

import { getNetworkConfig } from "./config";

export type BipLevel = "bip44" | "bip49" | "bip84";

export interface Levels {
	purpose: number;
	coinType: number;
	account?: number;
	change?: number;
	index?: number;
}

@IoC.injectable()
export class AddressFactory {
	@IoC.inject(IoC.BindingType.ConfigRepository)
	protected readonly configRepository!: Coins.ConfigRepository;

	#network!: bitcoin.networks.Network;

	@IoC.postConstruct()
	private onPostConstruct(): void {
		this.#network = getNetworkConfig(this.configRepository);
	}

	public getLevel(options?: Services.IdentityOptions): Levels {
		if (options?.bip44) {
			return {
				purpose: 44,
				coinType: this.configRepository.get(Coins.ConfigKey.Slip44),
				account: options?.bip44?.account,
				change: options?.bip44?.change,
				index: options?.bip44?.addressIndex,
			};
		}

		if (options?.bip49) {
			return {
				purpose: 49,
				coinType: this.configRepository.get(Coins.ConfigKey.Slip44),
				account: options?.bip49?.account,
				change: options?.bip49?.change,
				index: options?.bip49?.addressIndex,
			};
		}

		if (options?.bip84) {
			return {
				purpose: 84,
				coinType: this.configRepository.get(Coins.ConfigKey.Slip44),
				account: options?.bip84?.account,
				change: options?.bip84?.change,
				index: options?.bip84?.addressIndex,
			};
		}

		throw new Exceptions.Exception("Unable to determine level");
	}

	public bip44(mnemonic: string, options?: Services.IdentityOptions): Services.AddressDataTransferObject {
		const levels = this.getLevel(options);

		return this.#derive(
			"bip44",
			levels,
			bitcoin.payments.p2pkh({
				pubkey: BIP44.deriveChild(mnemonic, levels).publicKey,
				network: this.#network,
			}),
		);
	}

	public bip49(mnemonic: string, options?: Services.IdentityOptions): Services.AddressDataTransferObject {
		const levels = this.getLevel(options);

		return this.#derive(
			"bip49",
			levels,
			bitcoin.payments.p2sh({
				redeem: bitcoin.payments.p2wpkh({
					pubkey: BIP44.deriveChild(mnemonic, levels).publicKey,
					network: this.#network,
				}),
				network: this.#network,
			}),
		);
	}

	public bip84(mnemonic: string, options?: Services.IdentityOptions): Services.AddressDataTransferObject {
		const levels = this.getLevel(options);

		return this.#derive(
			"bip84",
			levels,
			bitcoin.payments.p2wpkh({
				pubkey: BIP44.deriveChild(mnemonic, levels).publicKey,
				network: this.#network,
			}),
		);
	}

	#derive(type: BipLevel, levels: Levels, payment: bitcoin.payments.Payment): Services.AddressDataTransferObject {
		const { address } = payment;

		if (!address) {
			throw new Error("Failed to derive an address.");
		}

		return { type, address, path: BIP44.stringify(levels) };
	}
}
