import { parseURI } from "./parse-uri";

	test("should return all values", () => {
		assert.equal(parseURI("https://domain.com/path?query=value#fragment"), {
			authority: "domain.com",
			fragment: "fragment",
			path: "/path",
			query: "query=value",
			scheme: "https",
		});
	});

	test("should work just the domain", () => {
		assert.equal(parseURI("https://domain.com/"), {
			authority: "domain.com",
			fragment: undefined,
			path: "/",
			query: undefined,
			scheme: "https",
		});
	});

	test("should work just the domain and path", () => {
		assert.equal(parseURI("https://domain.com/path"), {
			authority: "domain.com",
			fragment: undefined,
			path: "/path",
			query: undefined,
			scheme: "https",
		});
	});

	test("should work just the domain and query", () => {
		assert.equal(parseURI("https://domain.com/?query=value"), {
			authority: "domain.com",
			fragment: undefined,
			path: "/",
			query: "query=value",
			scheme: "https",
		});
	});

	test("should work just the domain and fragment", () => {
		assert.equal(parseURI("https://domain.com/#fragment"), {
			authority: "domain.com",
			fragment: "fragment",
			path: "/",
			query: undefined,
			scheme: "https",
		});
	});
