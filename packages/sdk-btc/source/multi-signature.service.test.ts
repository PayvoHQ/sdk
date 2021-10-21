import "jest-extended";
import { jest } from "@jest/globals";

import { IoC, Services, Signatories } from "@payvo/sdk";
import nock from "nock";

import { createService } from "../test/mocking";
import { SignedTransactionData } from "./signed-transaction.dto";
import { MultiSignatureService } from "./multi-signature.service";
import { ClientService } from "./client.service";
import { MultiSignatureSigner } from "./multi-signature.signer";
import { KeyPairService } from "./key-pair.service";
import { LedgerService } from "./ledger.service";
import { PublicKeyService } from "./public-key.service";
import { AddressService } from "./address.service";
import { BindingType } from "./constants";
import {
	manyMusigRegistrationTxs,
	oneSignatureMusigRegistrationTx,
	oneSignatureTransferTx,
	threeSignatureMusigRegistrationTx,
	twoSignatureMusigRegistrationTx,
	unsignedMusigRegistrationTx,
	unsignedTransferTx,
} from "../test/fixtures/musig-txs";
import { musig } from "../test/fixtures/musig";
import { UUID } from "@payvo/cryptography";
import { ConfirmedTransactionData } from "../../sdk-avax/source/confirmed-transaction.dto";
import { WalletData } from "../../sdk-avax/source/wallet.dto";

let subject: MultiSignatureService;

beforeAll(async () => {
	nock.disableNetConnect();

	subject = await createService(MultiSignatureService, "btc.testnet", (container) => {
		container.constant(IoC.BindingType.Container, container);
		container.singleton(IoC.BindingType.AddressService, AddressService);
		container.singleton(IoC.BindingType.ClientService, ClientService);
		container.constant(IoC.BindingType.DataTransferObjects, {
			SignedTransactionData,
			ConfirmedTransactionData,
			WalletData,
		});
		container.singleton(IoC.BindingType.DataTransferObjectService, Services.AbstractDataTransferObjectService);
		container.singleton(BindingType.MultiSignatureSigner, MultiSignatureSigner);
		container.singleton(IoC.BindingType.KeyPairService, KeyPairService);
		container.singleton(IoC.BindingType.LedgerService, LedgerService);
		container.singleton(IoC.BindingType.PublicKeyService, PublicKeyService);
	});
});

afterEach(() => nock.cleanAll());

describe("MultiSignatureService", () => {
	describe("multi signature registration", () => {
		let fixtures;

		beforeEach(async () => {
			fixtures = { result: [...manyMusigRegistrationTxs] };
		});

		test("#allWithPendingState", async () => {
			nock("https://btc-test-musig.payvo.com").post("/").reply(200, fixtures);

			await expect(
				subject.allWithPendingState(
					"Vpub5mtyU6Hx9xrx63Y3W4aGW1LuQkmwrq9xsQNgX7tDAM8DTHhE7vXMZ7Hue2FR8SMAGDW57fy76HFmN1jnckSmeX2cDMWVA1KViot6bLgJZuN",
				),
			).resolves.toBeArrayOfSize(2);
		});

		test("#allWithReadyState", async () => {
			nock("https://btc-test-musig.payvo.com").post("/").reply(200, fixtures);

			await expect(
				subject.allWithReadyState(
					"Vpub5mtyU6Hx9xrx63Y3W4aGW1LuQkmwrq9xsQNgX7tDAM8DTHhE7vXMZ7Hue2FR8SMAGDW57fy76HFmN1jnckSmeX2cDMWVA1KViot6bLgJZuN",
				),
			).resolves.toBeArrayOfSize(2);
		});

		test("#findById", async () => {
			nock("https://btc-test-musig.payvo.com").post("/").reply(200, { result: oneSignatureMusigRegistrationTx });

			await expect(
				subject.findById(
					"Vpub5mtyU6Hx9xrx63Y3W4aGW1LuQkmwrq9xsQNgX7tDAM8DTHhE7vXMZ7Hue2FR8SMAGDW57fy76HFmN1jnckSmeX2cDMWVA1KViot6bLgJZuN",
				),
			).resolves.toBeObject();
		});

		test("#broadcast", async () => {
			nock("https://btc-test-musig.payvo.com")
				.post("/")
				.reply(200, { result: { id: "abc" } })
				.post("/")
				.reply(200, { result: { id: "abc" } });

			await expect(subject.broadcast({})).resolves.toEqual({ accepted: ["abc"], errors: {}, rejected: [] });
			await expect(subject.broadcast({ asset: { multiSignature: "123" } })).resolves.toEqual({
				accepted: ["abc"],
				errors: {},
				rejected: [],
			});
		});

		test("#addSignature", async () => {
			// We need a deep copy as signing modifies the signatures and public keys
			const transactionData = JSON.parse(JSON.stringify(unsignedMusigRegistrationTx));

			const wallet1 = {
				signingKey: musig.accounts[0].mnemonic,
				path: musig.accounts[0].nativeSegwitMasterPath,
			};
			const signatory = new Signatories.Signatory(
				new Signatories.MnemonicSignatory({
					signingKey: wallet1.signingKey,
					address: "address", // Not needed / used
					publicKey: wallet1.path, // TODO for now we use publicKey for passing path
					privateKey: "privateKey", // Not needed / used
				}),
			);
			expect((await subject.addSignature(transactionData, signatory)).data()).toEqual(
				oneSignatureMusigRegistrationTx,
			);

			const wallet2 = {
				signingKey: musig.accounts[1].mnemonic,
				path: musig.accounts[1].nativeSegwitMasterPath,
			};
			const signatory2 = new Signatories.Signatory(
				new Signatories.MnemonicSignatory({
					signingKey: wallet2.signingKey,
					address: "address", // Not needed / used
					publicKey: wallet2.path, // TODO for now we use publicKey for passing path
					privateKey: "privateKey", // Not needed / used
				}),
			);
			expect((await subject.addSignature(transactionData, signatory2)).data()).toEqual(
				twoSignatureMusigRegistrationTx,
			);

			const wallet3 = {
				signingKey: musig.accounts[2].mnemonic,
				path: musig.accounts[2].nativeSegwitMasterPath,
			};
			const signatory3 = new Signatories.Signatory(
				new Signatories.MnemonicSignatory({
					signingKey: wallet3.signingKey,
					address: "address", // Not needed / used
					publicKey: wallet3.path, // TODO for now we use publicKey for passing path
					privateKey: "privateKey", // Not needed / used
				}),
			);
			expect((await subject.addSignature(transactionData, signatory3)).data()).toEqual(
				threeSignatureMusigRegistrationTx,
			);
		});

		describe.each([
			{ tx: unsignedMusigRegistrationTx, expected: false },
			{ tx: oneSignatureMusigRegistrationTx, expected: false },
			{ tx: twoSignatureMusigRegistrationTx, expected: false },
			{ tx: threeSignatureMusigRegistrationTx, expected: true },
		])("#isMultiSignatureRegistrationReady", ({ tx, expected }) => {
			test(`when already signed by ${tx.signatures.length} participants`, async () => {
				const transaction = (await createService(SignedTransactionData)).configure(tx.id, tx);

				expect(subject.isMultiSignatureReady(transaction)).toBe(expected);
			});
		});

		test("#needsSignatures", async () => {
			const transaction = (await createService(SignedTransactionData)).configure("123", { signatures: [] });

			expect(subject.needsSignatures(transaction)).toBeFalse();
		});

		test("#needsAllSignatures", async () => {
			const transaction = (await createService(SignedTransactionData)).configure("123", {
				signatures: [],
				multiSignature: {
					publicKeys: [
						"0301fd417566397113ba8c55de2f093a572744ed1829b37b56a129058000ef7bce",
						"034151a3ec46b5670a682b0a63394f863587d1bc97483b1b6c70eb58e7f0aed192",
					],
					min: 2,
				},
			});

			expect(subject.needsAllSignatures(transaction)).toBeTrue();
		});

		test("#needsWalletSignature", async () => {
			const transaction = (await createService(SignedTransactionData)).configure(
				oneSignatureMusigRegistrationTx.id,
				oneSignatureMusigRegistrationTx,
			);

			expect(
				subject.needsWalletSignature(
					transaction,
					"Vpub5mtyU6Hx9xrx63Y3W4aGW1LuQkmwrq9xsQNgX7tDAM8DTHhE7vXMZ7Hue2FR8SMAGDW57fy76HFmN1jnckSmeX2cDMWVA1KViot6bLgJZuN",
				),
			).toBeTrue();

			expect(
				subject.needsWalletSignature(
					transaction,
					"Vpub5mYgzMb93fDtChZ2xmY7g3aEgHFjdgQE6P596AiL5zENEcVjDCciGfWmhZJngn6gVmBRh6E1Vp7aZYY7wQkMRTQSKhauGwYAUEdiGbS35D1",
				),
			).toBeFalse();
		});

		test("#needsFinalSignature", async () => {
			const transaction = (await createService(SignedTransactionData)).configure("123", { signatures: [] });

			expect(subject.needsFinalSignature(transaction)).toBeFalse();
		});

		describe.each([
			{ tx: unsignedMusigRegistrationTx, expected: 3 },
			{ tx: oneSignatureMusigRegistrationTx, expected: 2 },
			{ tx: twoSignatureMusigRegistrationTx, expected: 1 },
			{ tx: threeSignatureMusigRegistrationTx, expected: 0 },
		])("#remainingSignatureCount", ({ tx, expected }) => {
			test(`when already signed by ${tx.signatures.length} participants`, async () => {
				const transaction = (await createService(SignedTransactionData)).configure(tx.id, tx);

				expect(subject.remainingSignatureCount(transaction)).toBe(expected);
			});
		});
	});

	describe("transfer", () => {
		test("#broadcast", async () => {
			jest.spyOn(UUID, "random").mockReturnValueOnce("68db1bb0-d747-48e8-b6f6-e347cc01b568");

			nock("https://btc-test-musig.payvo.com")
				.post(
					"/",
					'{"jsonrpc":"2.0","id":"68db1bb0-d747-48e8-b6f6-e347cc01b568","method":"store","params":{"data":{"id":"189f015c-2a58-4664-83f4-0b331fa9172a","multiSignature":{"min":2,"numberOfSignatures":3,"publicKeys":["Vpub5mYgzMb93fDtChZ2xmY7g3aEgHFjdgQE6P596AiL5zENEcVjDCciGfWmhZJngn6gVmBRh6E1Vp7aZYY7wQkMRTQSKhauGwYAUEdiGbS35D1","Vpub5mtyU6Hx9xrx63Y3W4aGW1LuQkmwrq9xsQNgX7tDAM8DTHhE7vXMZ7Hue2FR8SMAGDW57fy76HFmN1jnckSmeX2cDMWVA1KViot6bLgJZuN","Vpub5mSSLBPFi3acdjk5giwrmA7gXPAJsiLXXKibgjXYycH1gp95t2Pqv3U8dT9kEGxvAdfiN5DGmozDmZ7sJyDuMgfxt4h4KujF7MWt5tQH8py"]},"senderPublicKey":"0277ff9d72486136c7ee68abd46b13d3c1cef1b79f5604cdafafca0d880851bd73","psbt":"cHNidP8BAH0CAAAAAfwqGh7h9o7dS3ijZ/AtMBq9b4+Iwa3oO+cHPfxYif2WAQAAAAD/////AhAnAAAAAAAAFgAU8+nfdtXMv7TinAR6lCgVoypHesRSSgAAAAAAACIAIMwp/GLML5b+bmRjjYlfxK/zvrX8W6X6/wilSXNZq/oIAAAAAAABASvYcgAAAAAAACIAIPyiCzC4pKiEgQmYJffOzuMceywF5Ht0PbysptyeipjxAAAA","signatures":[]},"multiSignature":{"min":2,"numberOfSignatures":3,"publicKeys":["Vpub5mYgzMb93fDtChZ2xmY7g3aEgHFjdgQE6P596AiL5zENEcVjDCciGfWmhZJngn6gVmBRh6E1Vp7aZYY7wQkMRTQSKhauGwYAUEdiGbS35D1","Vpub5mtyU6Hx9xrx63Y3W4aGW1LuQkmwrq9xsQNgX7tDAM8DTHhE7vXMZ7Hue2FR8SMAGDW57fy76HFmN1jnckSmeX2cDMWVA1KViot6bLgJZuN","Vpub5mSSLBPFi3acdjk5giwrmA7gXPAJsiLXXKibgjXYycH1gp95t2Pqv3U8dT9kEGxvAdfiN5DGmozDmZ7sJyDuMgfxt4h4KujF7MWt5tQH8py"]}}}',
				)
				.reply(
					200,
					'{"id":"68db1bb0-d747-48e8-b6f6-e347cc01b568","jsonrpc":"2.0","result":{"id":"189f015c-2a58-4664-83f4-0b331fa9172a"}}',
				);

			await expect(subject.broadcast(unsignedTransferTx)).resolves.toEqual({
				accepted: [unsignedTransferTx.id],
				errors: {},
				rejected: [],
			});
		});

		describe.each([
			{ tx: unsignedTransferTx, expected: 2 },
			// { tx: twoSignatureMusigRegistrationTx, expected: 1 },
			// { tx: threeSignatureMusigRegistrationTx, expected: 0 },
		])("#remainingSignatureCount", ({ tx, expected }) => {
			test(`when already signed by ${tx.signatures.length} participants`, async () => {
				const transaction = (await createService(SignedTransactionData)).configure(tx.id, tx);

				expect(subject.remainingSignatureCount(transaction)).toBe(expected);
			});
		});

		test("#addSignature", async () => {
			// We need a deep copy as signing modifies the signatures and public keys
			const transactionData = JSON.parse(JSON.stringify(unsignedTransferTx));

			const wallet1 = {
				signingKey: musig.accounts[0].mnemonic,
				path: musig.accounts[0].nativeSegwitMasterPath,
			};
			const signatory = new Signatories.Signatory(
				new Signatories.MnemonicSignatory({
					signingKey: wallet1.signingKey,
					address: "address", // Not needed / used
					publicKey: wallet1.path, // TODO for now we use publicKey for passing path
					privateKey: "privateKey", // Not needed / used
				}),
			);
			expect((await subject.addSignature(transactionData, signatory)).data()).toEqual(oneSignatureTransferTx);
			// psbt with wallet 3 signature from Electrum: cHNidP8BAH0CAAAAAfwqGh7h9o7dS3ijZ/AtMBq9b4+Iwa3oO+cHPfxYif2WAQAAAAD/////AhAnAAAAAAAAFgAU8+nfdtXMv7TinAR6lCgVoypHesRSSgAAAAAAACIAIMwp/GLML5b+bmRjjYlfxK/zvrX8W6X6/wilSXNZq/oIAAAAAAABAP17AQIAAAAAAQFKD67a/3Sxj3AG8rL4EwfMW4FUwADiXTEYvIfKwT+2bQEAAAAA/v///wIQJwAAAAAAABYAFKAaFjbzNQbAUr9KNkzlOzlOeqRb2HIAAAAAAAAiACD8ogswuKSohIEJmCX3zs7jHHssBeR7dD28rKbcnoqY8QQARzBEAiAtaxxe83vicwaMFPlfyPwgCZ2GV9Z2ZmLUKVb60ISinAIgFqnEi9wztQ/xIKEfGEABa2u6rCSP0tGJVX/zptWnhnUBRzBEAiBaXFplmx8pD968q30SVE0qZYFL5tCIAI7Fm6MvLRCLbAIgWL1twFWNx6iuOZo3//qhv36b6N1+Sv5V4TiVcVjJVxUBaVIhAv6jUnyTmJcbxskb4eZdaL+DG9R+RYV2svm1p5J110/xIQN8LVybhIgH9ucde0Y7N4+GqXWDPi0s9Yn5DGqbxP9ALCEDk7Tjvci0Sncb25QDKpc8kYzUMPV7RMqQ/lx6lORwoVZTriv/HwAiAgKgvEK9TUSpPgZjgcRCczQBNXqabzC9DtnDXdcOmglHBkcwRAIgSFVXMzVtUOgT/UiXZQ1Yx3rUvFDtHOmas9R0LE9Sy88CIGVoVn53aJ7PtD4WGP4woMPg/QjV/kUN2lFSOmlyPGfoAQEFaVIhAmlJkkdKe19U4y+VM+uGOOP+L+vh/ZH6WIUSBsH+ZdGKIQKgvEK9TUSpPgZjgcRCczQBNXqabzC9DtnDXdcOmglHBiED2hKkbMe9iAditOn7fplJbojdKrjPFduxldPYNIpGKsBTriIGAmlJkkdKe19U4y+VM+uGOOP+L+vh/ZH6WIUSBsH+ZdGKDJ2qNdMBAAAAAgAAACIGAqC8Qr1NRKk+BmOBxEJzNAE1eppvML0O2cNd1w6aCUcGHKi0tEgwAACAAQAAgAAAAIACAACAAQAAAAIAAAAiBgPaEqRsx72IB2K06ft+mUluiN0quM8V27GV09g0ikYqwAxhs2G/AQAAAAIAAAAAAAEBaVIhAwXIeFxVhhqFRKMSYi1MBTBxkyUWLh0F+yac1Xq276cJIQM3V5TNeopKsAJHq30AqPkb6oy9u9OtOrs1WDEUVYiHmSED8kGcmHvNWEH8OOTYrYHwrbObPsccZ9I7WWvShmJxrAxTriICAwXIeFxVhhqFRKMSYi1MBTBxkyUWLh0F+yac1Xq276cJHKi0tEgwAACAAQAAgAAAAIACAACAAQAAAAMAAAAiAgM3V5TNeopKsAJHq30AqPkb6oy9u9OtOrs1WDEUVYiHmQydqjXTAQAAAAMAAAAiAgPyQZyYe81YQfw45NitgfCts5s+xxxn0jtZa9KGYnGsDAxhs2G/AQAAAAMAAAAA

			const wallet2 = {
				signingKey: musig.accounts[1].mnemonic,
				path: musig.accounts[1].nativeSegwitMasterPath,
			};
			const signatory2 = new Signatories.Signatory(
				new Signatories.MnemonicSignatory({
					signingKey: wallet2.signingKey,
					address: "address", // Not needed / used
					publicKey: wallet2.path, // TODO for now we use publicKey for passing path
					privateKey: "privateKey", // Not needed / used
				}),
			);
			expect((await subject.addSignature(transactionData, signatory2)).data()).toEqual(
				twoSignatureMusigRegistrationTx,
			);

			const wallet3 = {
				signingKey: musig.accounts[2].mnemonic,
				path: musig.accounts[2].nativeSegwitMasterPath,
			};
			const signatory3 = new Signatories.Signatory(
				new Signatories.MnemonicSignatory({
					signingKey: wallet3.signingKey,
					address: "address", // Not needed / used
					publicKey: wallet3.path, // TODO for now we use publicKey for passing path
					privateKey: "privateKey", // Not needed / used
				}),
			);
			expect((await subject.addSignature(transactionData, signatory3)).data()).toEqual(
				threeSignatureMusigRegistrationTx,
			);
		});
	});
});
