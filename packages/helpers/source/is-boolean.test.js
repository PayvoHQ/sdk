import { isBoolean } from "./is-boolean";

	test("should pass", () => {
		assert.true(isBoolean(true));
	});

	test("should fail", () => {
		assert.false(isBoolean("false"));
	});
