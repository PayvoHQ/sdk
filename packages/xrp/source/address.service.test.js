import { assert, test } from "@payvo/sdk-test";
import { identity } from "../test/fixtures/identity";
import { createService } from "../test/mocking";
import { AddressService } from "./address.service";

let subject;

test.before.each(async () => {
	subject = await createService(AddressService);
});

test("should generate an output from a publicKey", async () => {
	const result = await subject.fromPublicKey(identity.publicKey);

	assert.equal(result, { type: "rfc6979", address: identity.address });
});

test("should generate an output from a secret", async () => {
	const result = await subject.fromSecret(identity.mnemonic);

	assert.equal(result, { type: "rfc6979", address: identity.address });
});

test("should validate an address", async () => {
	assert.true(await subject.validate(identity.address));
	assert.false(await subject.validate("invalid"));
});

test.run();
