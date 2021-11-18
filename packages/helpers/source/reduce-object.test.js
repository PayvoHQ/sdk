import { reduceObject } from "./reduce-object";

	test("should work with a function", () => {
		assert
			.equal(
				reduceObject(
					{ a: 1, b: 2, c: 1 },
					(result, value, key) => {
						(result[value] || (result[value] = [])).push(key);

						return result;
					},
					{},
				), { 1: ["a", "c"], 2: ["b"] });
	});
