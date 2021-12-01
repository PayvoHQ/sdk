import { Interfaces } from "./crypto/index.js";
import { WIF as BaseWIF } from "./crypto/identities/wif.js";
import { IoC, Services } from "@payvo/sdk";
import { BIP39 } from "@payvo/sdk-cryptography";
import { abort_if, abort_unless } from "@payvo/sdk-helpers";

import { BindingType } from "./coin.contract.js";

@IoC.injectable()
export class WIFService extends Services.AbstractWIFService {
	@IoC.inject(BindingType.Crypto)
	private readonly config!: Interfaces.NetworkConfig;

	public override async fromMnemonic(
		mnemonic: string,
		options?: Services.IdentityOptions,
	): Promise<Services.WIFDataTransferObject> {
		abort_unless(BIP39.compatible(mnemonic), "The given value is not BIP39 compliant.");

		return {
			wif: BaseWIF.fromPassphrase(mnemonic),
		};
	}

	public override async fromSecret(secret: string): Promise<Services.WIFDataTransferObject> {
		abort_if(BIP39.compatible(secret), "The given value is BIP39 compliant. Please use [fromMnemonic] instead.");

		return {
			wif: BaseWIF.fromPassphrase(secret),
		};
	}

	public override async fromPrivateKey(privateKey: string): Promise<Services.WIFDataTransferObject> {
		return {
			// @ts-ignore - We don't care about having a public key for this
			wif: BaseWIF.fromKeys({ privateKey, compressed: true }),
		};
	}
}
