import { partition } from "./partition";

test("#partition", () => {
	const users = [
		{ user: "barney", age: 36, active: false },
		{ user: "fred", age: 40, active: true },
		{ user: "pebbles", age: 1, active: false },
	];

	test("should work with a function", () => {
		assert.is(
			partition(users, ({ active }) => active),
			[
				[{ user: "fred", age: 40, active: true }],
				[
					{ user: "barney", age: 36, active: false },
					{ user: "pebbles", age: 1, active: false },
				],
			],
		);
	});
});
