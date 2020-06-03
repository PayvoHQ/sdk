import { Coins, Contracts } from "@arkecosystem/platform-sdk";
import { BigNumber } from "@arkecosystem/platform-sdk-support";

import { Avatar } from "./avatar";
import { Storage } from "./contracts";
import { Data } from "./data";
import { Settings } from "./settings";

export class Wallet {
	readonly #coin: Coins.Coin;
	readonly #wallet: Contracts.WalletData;
	readonly #data: Data;
	readonly #settings: Settings;
	readonly #avatar: string;

	private constructor(input: { coin: Coins.Coin; storage: Storage; wallet: Contracts.WalletData }) {
		this.#coin = input.coin;
		this.#wallet = input.wallet;
		this.#data = new Data(input.storage, `wallets.${this.address()}`);
		this.#settings = new Settings({
			namespace: `wallets.${this.address()}`,
			storage: input.storage,
			type: "wallet",
		});
		this.#avatar = Avatar.make(this.address());
	}

	public static async fromMnemonic(input: {
		id: string;
		mnemonic: string;
		coin: Coins.CoinSpec;
		network: string;
		httpClient: Contracts.HttpClient;
		storage: Storage;
	}): Promise<Wallet> {
		const coin = await Coins.CoinFactory.make(input.coin, {
			network: input.network,
			httpClient: input.httpClient,
		});

		const address: string = await coin.identity().address().fromMnemonic(input.mnemonic);

		return new Wallet({ coin, storage: input.storage, wallet: await coin.client().wallet(address) });
	}

	public coin(): Coins.Coin {
		return this.#coin;
	}

	public network(): string {
		return this.#coin.network().id;
	}

	public avatar(): string {
		// TODO: get either the setting or default avatar
		return this.#avatar;
	}

	public address(): string {
		return this.#wallet.address();
	}

	public publicKey(): string | undefined {
		return this.#wallet.publicKey();
	}

	public balance(): BigNumber {
		return this.#wallet.balance();
	}

	public nonce(): BigNumber {
		return this.#wallet.nonce();
	}

	public data(): Data {
		return this.#data;
	}

	public settings(): Settings {
		return this.#settings;
	}

	public toObject(): object {
		return {
			coin: this.coin(), // TODO: turn into string
			network: this.network(), // TODO: turn into string
			address: this.address(),
			publicKey: this.publicKey(),
		};
	}

	/**
	 * All methods below this line are convenience methods that serve as proxies to the underlying coin implementation.
	 *
	 * The purpose of these methods is to reduce duplication and prevent consumers from implementing
	 * convoluted custom implementations that deviate from how things should be used.
	 *
	 * Any changes in how things need to be handled by consumers should be made in this package!
	 */

	public transactions(): Promise<Contracts.CollectionResponse<Coins.TransactionDataCollection>> {
		return this.#coin.client().transactions({ address: this.address() });
	}

	public sentTransactions(): Promise<Contracts.CollectionResponse<Coins.TransactionDataCollection>> {
		return this.#coin.client().transactions({ senderId: this.address() });
	}

	public receivedTransactions(): Promise<Contracts.CollectionResponse<Coins.TransactionDataCollection>> {
		return this.#coin.client().transactions({ recipientId: this.address() });
	}
}
