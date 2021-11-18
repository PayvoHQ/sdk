import { assert, test } from "@payvo/sdk-test";

import { headerCase } from "./header-case";

	test("should turn any string into header case", () => {
		assert.is(headerCase("string"), "String");
		assert.is(headerCase("camelCase"), "Camel-Case");
		assert.is(headerCase("param-case"), "Param-Case");
		assert.is(headerCase("PascalCase"), "Pascal-Case");
		assert.is(headerCase("UPPER_CASE"), "Upper-Case");
		assert.is(headerCase("snake_case"), "Snake-Case");
		assert.is(headerCase("sentence case"), "Sentence-Case");
		assert.is(headerCase("Title Case"), "Title-Case");
		assert.is(headerCase("dot.case"), "Dot-Case");
	});
