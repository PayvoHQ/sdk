import { isEmptySet } from "./is-empty-set";

	test("should return true for an empty set", () => {
		assert.true(isEmptySet(new Set()));
	});
