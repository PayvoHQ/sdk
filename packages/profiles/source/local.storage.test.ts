import "mock-local-storage";

import { UUID } from "@payvo/sdk-cryptography";
import { describe } from "@payvo/sdk-test";

import { LocalStorage } from "./local.storage";

describe("LocalStorage", ({ assert, beforeAll, beforeEach, skip }) => {
	beforeAll(() => {
		global.window = { localStorage: global.localStorage };
	});

	beforeEach((context) => {
		context.subject = new LocalStorage("localstorage");
		context.key = UUID.random();
	});

	skip("should get all items", async (context) => {
		assert.equal(await context.subject.all(), {});

		await context.subject.set(context.key, "value");

		assert.equal(await context.subject.all(), { [context.key]: "value" });

		await context.subject.flush();

		assert.equal(await context.subject.all(), {});
	});

	skip("should should get the value for the given key", async (context) => {
		await context.subject.set(context.key, "value");

		assert.is(await context.subject.get(context.key), "value");
	});

	skip("should should set the value in the storage", async (context) => {
		assert.undefined(await context.subject.set(context.key, "value"));
	});

	skip("should should check if the given key exists", async (context) => {
		assert.false(await context.subject.has(context.key));

		await context.subject.set(context.key, "value");

		assert.true(await context.subject.has(context.key));
	});

	skip("should should forget the given key", async (context) => {
		assert.false(await context.subject.has(context.key));

		await context.subject.set(context.key, "value");

		assert.true(await context.subject.has(context.key));

		await context.subject.forget(context.key);

		assert.false(await context.subject.has(context.key));
	});

	skip("should flush the storage", async (context) => {
		assert.false(await context.subject.has(context.key));

		await context.subject.set(context.key, "value");

		assert.true(await context.subject.has(context.key));

		await context.subject.flush();

		assert.false(await context.subject.has(context.key));
	});

	skip("should count all items", async (context) => {
		assert.is(await context.subject.count(), 0);

		await context.subject.set(context.key, "value");

		assert.is(await context.subject.count(), 1);

		await context.subject.forget(context.key);

		assert.is(await context.subject.count(), 0);
	});

	skip("should create a snapshot and restore it", async (context) => {
		await context.subject.set("a", "b");

		assert.is(await context.subject.count(), 1);

		await context.subject.snapshot();

		assert.is(await context.subject.count(), 1);

		await context.subject.set(context.key, "value");

		assert.is(await context.subject.count(), 2);

		await context.subject.restore();

		assert.is(await context.subject.count(), 1);
	});

	skip("should fail to restore if there is no snapshot", async (context) => {
		await assert.rejects(() => context.subject.restore(), "There is no snapshot to restore.");
	});
});
