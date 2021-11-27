import { describe } from "@payvo/sdk-test";

import { isWeakSet } from "./is-weak-set";

describe("isWeakSet", async ({ assert, it, nock, loader }) => {
	it("should pass", () => {
		assert.true(isWeakSet(new WeakSet()));
	});

	it("should fail", () => {
		assert.false(isWeakSet(1));
	});
});
