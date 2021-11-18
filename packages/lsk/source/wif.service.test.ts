import { identity } from "../test/fixtures/identity.js";
import { createService, requireModule } from "../test/mocking.js";
import { WIFService } from "./wif.service.js";
import { WIF } from "@payvo/sdk-cryptography";

let subject: WIFService;

test.before.each(async () => {
	subject = await createService(WIFService);
});

describe("WIF", () => {
	it("should generate an output from a mnemonic", async () => {
		const result = await subject.fromMnemonic(identity.mnemonic);

		assert.is(result, { wif: identity.wif });
		assert.is(WIF.decode(result.wif).privateKey, identity.privateKey);
	});

	it("should generate an output from a mnemonic given a custom locale", async () => {
		const result = await subject.fromMnemonic(identity.mnemonic);

		assert.is(result, { wif: identity.wif });
	});

	it("should fail to generate an output from an invalid mnemonic", async () => {
		await assert.is(subject.fromMnemonic(undefined!)).rejects.toThrow();
	});

	it("should generate an output from a private key", async () => {
		const result = await subject.fromPrivateKey(identity.privateKey);

		assert.is(result, { wif: identity.wif });
		assert.is(WIF.decode(result.wif).privateKey, identity.privateKey);
	});

	it("should generate an output from a secret", async () => {
		await assert
			.is(subject.fromSecret(identity.mnemonic))
			.rejects.toEqual(new Error("The given value is BIP39 compliant. Please use [fromMnemonic] instead."));

		const result = await subject.fromSecret("abc");

		assert.is(result, { wif: "LvwxxwvWMU7BNF6VBo3vmUbHRZfsjyfrQJtDRTP5UMmtuhLWW4WU" });
	});

	it("should fail to generate an output from an invalid private key", async () => {
		await assert.is(subject.fromPrivateKey(undefined!)).rejects.toThrow();
	});
});
