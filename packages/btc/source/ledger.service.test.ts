import { describe } from "@payvo/sdk-test";
import { IoC, Services } from "@payvo/sdk";
import { openTransportReplayer, RecordStore } from "@ledgerhq/hw-transport-mocker";

import { ledger } from "../test/fixtures/ledger";
import { createService } from "../test/mocking";
import { AddressService } from "./address.service";
import { ClientService } from "./client.service";
import { LedgerService } from "./ledger.service";
import { SignedTransactionData } from "./signed-transaction.dto";
import { ConfirmedTransactionData } from "./confirmed-transaction.dto";
import { WalletData } from "./wallet.dto";
import { AddressFactory } from "./address.factory.js";
import { MultiSignatureSigner } from "./multi-signature.signer.js";
import { BindingType } from "./constants.js";

const createMockService = async (record) => {
	const transport = await createService(LedgerService, "btc.testnet", (container) => {
		container.constant(IoC.BindingType.Container, container);
		container.constant(IoC.BindingType.DataTransferObjects, {
			SignedTransactionData,
			ConfirmedTransactionData,
			WalletData,
		});
		container.singleton(IoC.BindingType.DataTransferObjectService, Services.AbstractDataTransferObjectService);
		container.singleton(BindingType.AddressFactory, AddressFactory);
		container.singleton(BindingType.MultiSignatureSigner, MultiSignatureSigner);
		container.singleton(IoC.BindingType.AddressService, AddressService);
		container.singleton(IoC.BindingType.ClientService, ClientService);
		container.constant(
			IoC.BindingType.LedgerTransportFactory,
			async () => await openTransportReplayer(RecordStore.fromString(record)),
		);
	});

	await transport.connect();

	return transport;
};

describe("LedgerService", async ({ assert, it, skip }) => {
	it("disconnect", async () => {
		const subject = await createMockService("");

		assert.undefined(await subject.disconnect());
	});

	it("disconnect", async () => {
		const subject = await createMockService("");

		assert.undefined(await subject.disconnect());
	});

	it("getVersion", async () => {
		const subject = await createMockService(ledger.appVersion.record);

		assert.is(await subject.getVersion(), ledger.appVersion.result);
	});

	skip("getPublicKey", async () => {
		const subject = await createMockService(ledger.publicKey.record);

		assert.is(await subject.getPublicKey(ledger.bip44.path), ledger.publicKey.result);
	});

	skip("getExtendedPublicKey", async () => {
		const subject = await createMockService(ledger.extendedPublicKey.record);

		assert.is(await subject.getExtendedPublicKey(ledger.extendedPublicKey.path), ledger.extendedPublicKey.result);
	});

	it("signMessage", async () => {
		const subject = await createMockService(ledger.message.record);

		assert.is(
			await subject.signMessage(ledger.bip44.path, Buffer.from(ledger.message.payload, "utf-8")),
			ledger.message.result,
		);
	});
});
