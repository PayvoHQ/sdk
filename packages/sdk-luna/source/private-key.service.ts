import { Exceptions, Services } from "@payvo/sdk";

import { deriveKey } from "./helpers";

export class PrivateKeyService extends Services.AbstractPrivateKeyService {
	public override async fromMnemonic(
		mnemonic: string,
		options?: Services.IdentityOptions,
	): Promise<Services.PrivateKeyDataTransferObject> {
		try {
			return { privateKey: deriveKey(mnemonic).privateKey.toString("hex") };
		} catch (error) {
			throw new Exceptions.CryptoException(error as any);
		}
	}
}
