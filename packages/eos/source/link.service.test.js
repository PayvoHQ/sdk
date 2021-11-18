import { Services } from "@payvo/sdk";

import { createService } from "../test/mocking";

let subject;

test.before(async () => {
	subject = await createService(Services.AbstractLinkService);
});

test("should generate a link for a block", async () => {
	assert.is(subject.block("id"), "https://eos-test.bloks.io/block/id"`);
});

test("should generate a link for a transaction", async () => {
	assert.is(subject.transaction("id"), "https://eos-test.bloks.io/transaction/id"`);
});

test("should generate a link for a wallet", async () => {
	assert.is(subject.wallet("id"), "https://eos-test.bloks.io/account/id"`);
});
