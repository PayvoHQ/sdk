import { BigNumber } from "@payvo/helpers";

import Fixture from "../test/fixtures/client/wallet.json";
import { WalletData } from "./wallet.dto";
import { createService, requireModule } from "../test/mocking";

let subject;

beforeAll(async () => {
	subject = (await createService(WalletData)).fill(Fixture);
});

describe("WalletData", () => {
	it("#address", () => {
		expect(subject.address()).toEqual("GD42RQNXTRIW6YR3E2HXV5T2AI27LBRHOERV2JIYNFMXOBA234SWLQQB");
	});

	it("#publicKey", () => {
		expect(subject.publicKey()).toEqual("GD42RQNXTRIW6YR3E2HXV5T2AI27LBRHOERV2JIYNFMXOBA234SWLQQB");
	});

	it("#balance", () => {
		expect(subject.balance().available).toEqual(BigNumber.make("17491629"));
	});

	it("#nonce", () => {
		expect(subject.nonce()).toEqual(BigNumber.make(24242));
	});

	it("#secondPublicKey", () => {
		expect(() => subject.secondPublicKey()).toThrow(/not implemented/);
	});

	it("#username", () => {
		expect(() => subject.username()).toThrow(/not implemented/);
	});

	it("#rank", () => {
		expect(() => subject.rank()).toThrow(/not implemented/);
	});

	it("#votes", () => {
		expect(() => subject.votes()).toThrow(/not implemented/);
	});

	it("#multiSignature", () => {
		expect(() => subject.multiSignature()).toThrow(/not implemented/);
	});

	it("#isMultiSignature", () => {
		expect(subject.isMultiSignature()).toBeFalse();
	});

	it("#isDelegate", () => {
		expect(subject.isDelegate()).toBeFalse();
	});

	it("#isSecondSignature", () => {
		expect(subject.isSecondSignature()).toBeFalse();
	});

	it("#isResignedDelegate", () => {
		expect(subject.isResignedDelegate()).toBeFalse();
	});
});
