import { Coins } from "@payvo/sdk";

import { container } from "./container.js";
import { Identifiers } from "./container.models.js";
import { ICoinService, IDataRepository } from "./contracts.js";

export class CoinService implements ICoinService {
	readonly #dataRepository: IDataRepository;

	public constructor(dataRepository: IDataRepository) {
		this.#dataRepository = dataRepository;
	}

	/** {@inheritDoc ICoinService.all} */
	public all(): Record<string, Coins.Coin> {
		return this.#dataRepository.all() as Record<string, Coins.Coin>;
	}

	/** {@inheritDoc ICoinService.values} */
	public values(): Coins.Coin[] {
		return this.#dataRepository.values();
	}

	/** {@inheritDoc ICoinService.entries} */
	public entries(): [string, string[]][] {
		const result: Record<string, string[]> = {};

		for (const [coin, networks] of Object.entries(this.all())) {
			result[coin] = [];

			for (const [network, children] of Object.entries(networks)) {
				if (children !== undefined) {
					for (const child of Object.keys(children)) {
						result[coin].push(`${network}.${child}`);
					}
				} else {
					result[coin].push(network);
				}
			}
		}

		return Object.entries(result);
	}

	/** {@inheritDoc ICoinService.get} */
	public get(coin: string, network: string): Coins.Coin {
		const instance: Coins.Coin | undefined = this.#dataRepository.get<Coins.Coin>(`${coin}.${network}`);

		if (instance === undefined) {
			throw new Error(`An instance for [${coin}.${network}] does not exist.`);
		}

		return instance;
	}

	/** {@inheritDoc ICoinService.set} */
	public set(coin: string, network: string, options: object = {}): Coins.Coin {
		const cacheKey = `${coin}.${network}`;

		if (this.#dataRepository.has(cacheKey)) {
			return this.#dataRepository.get(cacheKey)!;
		}

		const instance = Coins.CoinFactory.make(
			container.get<Coins.CoinBundle>(Identifiers.Coins)[coin.toUpperCase()],
			{
				httpClient: container.get(Identifiers.HttpClient),
				ledgerTransportFactory: container.get(Identifiers.LedgerTransportFactory),
				network,
				...options,
			},
		);

		this.#dataRepository.set(cacheKey, instance);

		return instance;
	}

	/** {@inheritDoc ICoinService.has} */
	public has(coin: string, network: string): boolean {
		return this.#dataRepository.has(`${coin}.${network}`);
	}

	/** {@inheritDoc ICoinService.flush} */
	public flush(): void {
		this.#dataRepository.flush();
	}
}
