import { describe } from "@payvo/sdk-test";
import { identity } from "../test/fixtures/identity";
import { createService } from "../test/mocking";
import { WIFService } from "./wif.service";

let subject;

describe("WIFService", async ({ beforeEach, it, assert }) => {
	beforeEach(async () => {
		subject = await createService(WIFService);
	});

	it("should generate an output from a mnemonic", async () => {
		assert.equal(await subject.fromMnemonic(identity.mnemonic), {
			wif: "L2M8fs13JtFto4VZVN9fh3vVB2bFmEs3ykJmwuxTSpkA7yTCSUf8",
			path: "m/44'/195'/0'/0/0",
		});
	});
});
