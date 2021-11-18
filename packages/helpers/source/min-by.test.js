import { minBy } from "./min-by";

test("#minBy", () => {
	test("should work with a function", () => {
		assert.is(
			minBy([{ n: 2 }, { n: 3 }, { n: 1 }, { n: 5 }, { n: 4 }], (o) => o.n),
			{ n: 1 },
		);
	});
});
