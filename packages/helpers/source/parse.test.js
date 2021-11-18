import { parse } from "./parse";

	test("should parse valid json", () => {
		assert.equal(parse("{}"), {});
	});

	test("should fail to parse invalid json", () => {
		assert.throw(() => parse("{"), "Unexpected end of JSON input");
	});
