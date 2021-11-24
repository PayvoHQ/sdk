import { describe } from "@payvo/sdk-test";
import { identity } from "../test/fixtures/identity";
import { createService } from "../test/mocking";
import { KeyPairService } from "./key-pair.service";

let subject;

describe("KeyPairService", async ({ beforeEach, it, assert }) => {
	beforeEach(async () => {
		subject = await createService(KeyPairService);
	});

	it("should generate an output from a mnemonic", async () => {
		const result = await subject.fromMnemonic(identity.mnemonic);

		assert.equal(result, {
			path: "m/44'/148'/0'",
			privateKey: "SCVPKP4VG6NDJHHGQ7OLDGWO6TZMZTUCKRMKUQ3KDGHCAJ7J5RG3L7WC",
			publicKey: "GCGYSPQBSQCJKNDXDISBSXAM3THK7MACUVZGEMXF6XRZCPGAWCUGXVNC",
		});
	});

	it("should generate an output from a private key", async () => {
		const result = await subject.fromPrivateKey(identity.privateKey);

		assert.equal(result, {
			privateKey: identity.privateKey,
			publicKey: identity.publicKey,
		});
	});
});
