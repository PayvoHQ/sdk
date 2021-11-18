import { groupBy } from "./group-by.js";

describe("#groupBy", () => {
	it("should work with a function", () => {
		assert
			.is(
				groupBy(
					[
						{ first: "John", last: "Doe" },
						{ first: "Jane", last: "Doe" },
						{ first: "John", last: "Dorian" },
					],
					(o) => o.last,
				),
			)
			.toEqual({
				Doe: [
					{ first: "John", last: "Doe" },
					{ first: "Jane", last: "Doe" },
				],
				Dorian: [{ first: "John", last: "Dorian" }],
			});
	});

	it("should with a native function", () => {
		assert.is(groupBy([6.1, 4.2, 6.3], Math.floor), { "4": [4.2], "6": [6.1, 6.3] });
	});
});
