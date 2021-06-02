import { KnownWallet, KnownWalletService } from "../contracts";

export abstract class AbstractKnownWalletService implements KnownWalletService {
	public async __destruct(): Promise<void> {}

	public async all(): Promise<KnownWallet[]> {
		return [];
	}
}
