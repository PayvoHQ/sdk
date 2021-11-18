import { clone } from "./clone.js";

describe("#clone", () => {
	it("should work with an array", () => {
		const objects = [{ a: 1 }, { b: 2 }];

		assert.is(clone(objects), objects);
	});

	it("should work with an object", () => {
		const objects = { a: 1 };

		assert.is(clone(objects), objects);
	});
});
