import "jest-extended";

import { IoC, Services } from "@payvo/sdk";
import { openTransportReplayer, RecordStore } from "@ledgerhq/hw-transport-mocker";
import nock from "nock";

import { ledger } from "../test/fixtures/ledger";
import { createService, require } from "../test/mocking";
import { DataTransferObjects } from "./coin.dtos";
import { AddressService } from "./address.service";
import { ClientService } from "./client.service";
import { LedgerService } from "./ledger.service";
import { BindingType } from "./coin.contract";
import { AssetSerializer } from "./asset.serializer";
import { TransactionSerializer } from "./transaction.serializer";

const createMockService = async (record: string) => {
	const transport = await createService(LedgerService, "lsk.mainnet", (container) => {
		container.constant(IoC.BindingType.Container, container);
		container.singleton(IoC.BindingType.AddressService, AddressService);
		container.singleton(IoC.BindingType.ClientService, ClientService);
		container.constant(IoC.BindingType.DataTransferObjects, DataTransferObjects);
		container.singleton(IoC.BindingType.DataTransferObjectService, Services.AbstractDataTransferObjectService);
		container.singleton(BindingType.AssetSerializer, AssetSerializer);
		container.singleton(BindingType.TransactionSerializer, TransactionSerializer);
	});

	await transport.connect(await openTransportReplayer(RecordStore.fromString(record)));

	return transport;
};

describe("destruct", () => {
	it("should pass with a resolved transport closure", async () => {
		const lsk = await createMockService("");

		await expect(lsk.__destruct()).resolves.toBeUndefined();
	});
});

describe("getVersion", () => {
	it("should pass with an app version", async () => {
		const lsk = await createMockService(ledger.appVersion.record);

		await expect(lsk.getVersion()).resolves.toEqual(ledger.appVersion.result);
	});
});

describe("getPublicKey", () => {
	it("should pass with a compressed publicKey", async () => {
		const lsk = await createMockService(ledger.publicKey.record);

		await expect(lsk.getPublicKey(ledger.bip44.path)).resolves.toEqual(ledger.publicKey.result);
	});
});

describe("signTransaction", () => {
	it("should pass with a signature", async () => {
		const lsk = await createMockService(ledger.transaction.record);

		await expect(
			lsk.signTransaction(ledger.bip44.path, Buffer.from(ledger.transaction.payload, "hex")),
		).resolves.toEqual(ledger.transaction.result);
	});
});

describe("signMessage", () => {
	it("should pass with a signature", async () => {
		const lsk = await createMockService(ledger.message.record);

		await expect(lsk.signMessage(ledger.bip44.path, Buffer.from(ledger.message.payload, "hex"))).resolves.toEqual(
			ledger.message.result,
		);
	});
});

describe("scan", () => {
	afterEach(() => nock.cleanAll());

	beforeAll(() => nock.disableNetConnect());

	it("should return scanned wallet", async () => {
		nock(/.+/)
			.get("/api/accounts")
			.query({ address: "7399986239080551550L" })
			.reply(200, await require("../test/fixtures/client/wallet-0.json"));

		nock(/.+/)
			.get("/api/accounts")
			.query({ address: "11603034586667438647L" })
			.reply(200, await require("../test/fixtures/client/wallet-1.json"));

		nock(/.+/)
			.get("/api/accounts")
			.query({ address: "8261766349562104742L" })
			.reply(200, await require("../test/fixtures/client/wallet-2.json"));

		nock(/.+/)
			.get("/api/accounts")
			.reply(200, await require("../test/fixtures/client/wallet-3.json"));

		const lsk = await createMockService(ledger.wallets.record);

		const walletData = await lsk.scan();

		expect(Object.keys(walletData)).toHaveLength(1);
		expect(walletData).toMatchSnapshot();
	});
});
