import { Exceptions, IoC, Services } from "@payvo/sdk";
import { BIP32 } from "@payvo/cryptography";
import * as bitcoin from "bitcoinjs-lib";

@IoC.injectable()
export class KeyPairService extends Services.AbstractKeyPairService {
	public override async fromMnemonic(
		mnemonic: string,
		options?: Services.IdentityOptions,
	): Promise<Services.KeyPairDataTransferObject> {
		try {
			return this.#normalize(
				bitcoin.ECPair.fromPrivateKey(
					BIP32.fromMnemonic(mnemonic, this.configRepository.get("network.constants")).privateKey!,
				),
			);
		} catch (error) {
			throw new Exceptions.CryptoException(error as any);
		}
	}

	public override async fromPrivateKey(privateKey: string): Promise<Services.KeyPairDataTransferObject> {
		try {
			return this.#normalize(bitcoin.ECPair.fromPrivateKey(Buffer.from(privateKey, "hex")));
		} catch (error) {
			throw new Exceptions.CryptoException(error as any);
		}
	}

	public override async fromWIF(wif: string): Promise<Services.KeyPairDataTransferObject> {
		try {
			return this.#normalize(bitcoin.ECPair.fromWIF(wif));
		} catch (error) {
			throw new Exceptions.CryptoException(error as any);
		}
	}

	#normalize(keyPair: bitcoin.ECPair.ECPairInterface): Services.KeyPairDataTransferObject {
		return {
			publicKey: keyPair.publicKey.toString("hex"),
			privateKey: keyPair.privateKey!.toString("hex"),
		};
	}
}
