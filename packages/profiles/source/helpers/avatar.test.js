import { assert, describe, mockery, loader, test } from "@payvo/sdk-test";
import { Avatar } from "./avatar";

test("Helpers.Avatar", () => {
	assert.string(Avatar.make("Hello World"));
});

test.run();
