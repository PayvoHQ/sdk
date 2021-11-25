import { describe } from "@payvo/sdk-test";
import { identity } from "../test/fixtures/identity";
import { createService } from "../test/mocking";
import { KeyPairService } from "./key-pair.service";

describe('KeyPairService', async ({ beforeEach, it, assert }) => {
	beforeEach(async (context) => {
		context.subject = await createService(KeyPairService);
	})

	it("should generate an output from a mnemonic", async ({ subject }) => {
		assert.equal(await subject.fromMnemonic(identity.mnemonic), {
			privateKey: identity.privateKey,
			publicKey: identity.publicKey,
		});
	});

	it("should generate an output from a privateKey", async ({ subject }) => {
		assert.equal(await subject.fromPrivateKey(identity.privateKey), {
			privateKey: identity.privateKey,
			publicKey: identity.publicKey,
		});
	});
});
