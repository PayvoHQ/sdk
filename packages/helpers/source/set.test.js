import { set } from "./set";

test("#set", () => {
	test("should not do anything if the target is not an object", () => {
		assert.false(set(undefined, "a.b.c", 4));
	});

	test("should work with a string or array as path", () => {
		const object = { a: { b: { c: 3 } } };

		set(object, "a.b.c", 4);

		assert.is(object.a.b.c, 4);

		set(object, "x.y.z", 5);

		assert.is(object.x.y.z, 5);
	});
});
