import { Context, suite, Test } from "uvu";
import { z as zod } from "zod";

import { assert } from "./assert.js";
import { eachSuite } from "./each.js";
import { runHook, runHookWithClean } from "./hooks.js";
import { nock } from "./nock.js";
import { loader } from "./loader.js";
import { Mockery } from "./mockery.js";

type ContextFunction = () => Context;
type ContextPromise = () => Promise<Context>;

const runSuite = (suite: Test, callback: Function): void => {
	callback({
		afterAll: async (callback_: Function) => suite.after(runHookWithClean(callback_)),
		afterEach: async (callback_: Function) => suite.after.each(runHookWithClean(callback_)),
		assert,
		beforeAll: async (callback_: Function) => suite.before(runHook(callback_)),
		beforeEach: async (callback_: Function) => suite.before.each(runHook(callback_)),
		each: eachSuite(suite),
		it: suite,
		loader,
		nock,
		mock: Mockery.mock,
		only: suite.only,
		should: suite,
		skip: suite.skip,
		spy: Mockery.spy,
		stub: Mockery.stub,
		test: suite,
		zod,
	});

	suite.run();
};

export const describe = (title: string, callback: Function): void => runSuite(suite(title), callback);

export const describeWithContext = async (
	title: string,
	context: Context | ContextFunction | ContextPromise,
	callback: Function,
): Promise<void> => runSuite(suite(title, typeof context === "function" ? await context() : context), callback);
