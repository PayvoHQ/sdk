import { Test } from "@payvo/sdk";
import { Request } from "@payvo/http-got";

import { manifest } from "../source/manifest";
import { schema } from "../source/coin.schema";

export const createService = <T = any>(service: any, network: string = "xrp.mainnet", predicate?: Function): T => {
	return Test.createService({
		httpClient: new Request(),
		manifest: manifest.networks[network],
		predicate,
		schema,
		service,
	});
};

export const require = async (path: string): Promise<object> => (await import(path)).default;
