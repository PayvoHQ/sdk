import { Contracts, DTO } from "@payvo/sdk";
import { BigNumber } from "@payvo/sdk-helpers";

export class WalletData extends DTO.AbstractWalletData implements Contracts.WalletData {
	public override primaryKey(): string {
		return this.address();
	}

	public override address(): string {
		return this.data.address;
	}

	public override publicKey(): string | undefined {
		return this.data.publicKey;
	}

	public override balance(): Contracts.WalletBalance {
		return {
			total: this.bigNumberService.make(this.data.balance),
			available: this.bigNumberService.make(this.data.balance),
			fees: this.bigNumberService.make(this.data.balance),
		};
	}

	public override multiSignature(): Contracts.WalletMultiSignature {
		throw new Error("This wallet does not have a multi-signature registered.");
	}
}
