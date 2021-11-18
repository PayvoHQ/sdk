import { assert, fixture, test } from "@payvo/sdk-test";

import { HistoricalPriceTransformer } from "./historical-price-transformer";

const stubOptions = { type: "day", dateFormat: "DD.MM" };

		test("should transform the given data", async () => {
			const stubResponse = fixture.load("test/fixtures/cryptocompare/historical.json");

			const subject = new HistoricalPriceTransformer(stubResponse.Data);

			assert.object(subject.transform(stubOptions));
});

test.run();
