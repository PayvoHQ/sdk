import { describe } from "@payvo/sdk-test";

import { CURRENCIES } from "./currencies";

describe("CURRENCIES", ({ assert, it }) => {
	it("should have a list of currencies", () => {
		assert.snapshot("currencies", CURRENCIES);
	});
});
