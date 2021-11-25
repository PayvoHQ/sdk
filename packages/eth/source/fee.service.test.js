import { describe } from "@payvo/sdk-test";
import { nock } from "@payvo/sdk-test";

import { createService } from "../test/mocking";
import { FeeService } from "./fee.service";

describe('FeeService', async ({ beforeEach, afterEach, beforeAll, it, assert, loader }) => {
	beforeEach(async (context) => {
		context.subject = await createService(FeeService);
	});

	afterEach(() => nock.cleanAll());

	beforeAll(() => nock.disableNetConnect());

	it("should fetch all available fees", async ({ subject }) => {
		nock.fake("https://ethgas.watch").get("/api/gas").reply(200, loader.json(`test/fixtures/client/fees.json`));

		const result = await subject.all();

		assert.containKeys(result, [
			"transfer",
			"secondSignature",
			"delegateRegistration",
			"vote",
			"multiSignature",
			"ipfs",
			"multiPayment",
			"delegateResignation",
			"htlcLock",
			"htlcClaim",
			"htlcRefund",
		]);

		assert.equal(result.transfer, {
			min: "148",
			avg: "175",
			max: "199",
			static: "216",
		});
	});
});
