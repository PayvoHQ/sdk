import { isBigInt } from "./is-bigint";

test("#isBigInt", () => {
	test("should pass", () => {
		assert.is(isBigInt(BigInt(1)), true);
	});

	test("should fail", () => {
		assert.is(isBigInt("1"), false);
		assert.is(isBigInt(1), false);
	});
});
