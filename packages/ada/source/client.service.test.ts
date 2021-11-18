import { DTO, IoC, Services, Signatories, Test } from "@payvo/sdk";
import { BigNumber } from "@payvo/sdk-helpers";
import nock from "nock";

import { createService, requireModule } from "../test/mocking.js";
import { SignedTransactionData } from "./signed-transaction.dto.js";
import { WalletData } from "./wallet.dto.js";
import { ClientService } from "./client.service.js";
import { TransactionService } from "./transaction.service.js";
import { ConfirmedTransactionData } from "./confirmed-transaction.dto.js";

let subject: ClientService;

beforeAll(async () => {
    nock.disableNetConnect();

    subject = await createService(ClientService, undefined, (container) => {
        container.constant(IoC.BindingType.Container, container);
        container.constant(IoC.BindingType.DataTransferObjects, {
            SignedTransactionData,
            ConfirmedTransactionData,
            WalletData,
        });
        container.singleton(IoC.BindingType.DataTransferObjectService, Services.AbstractDataTransferObjectService);
    });
});

test.after.each(() => nock.cleanAll());

beforeAll(async () => {
    nock.disableNetConnect();
});

describe("ClientService", () => {
    it("#wallet should succeed", async () => {
        nock(/.+/)
            .post("/")
            .reply(200, requireModule(`../test/fixtures/client/transactions-0.json`))
            .post("/")
            .reply(200, requireModule(`../test/fixtures/client/transactions-20.json`))
            .post("/")
            .reply(200, requireModule(`../test/fixtures/client/utxos-aggregate.json`));

        const result = await subject.wallet({
            type: "address",
            value: "aec30330deaecdd7503195a0d730256faef87027022b1bdda7ca0a61bca0a55e4d575af5a93bdf4905a3702fadedf451ea584791d233ade90965d608bac57304",
        });

        assert.is(result instanceof WalletData);
        assert.is(result.address(),
            "aec30330deaecdd7503195a0d730256faef87027022b1bdda7ca0a61bca0a55e4d575af5a93bdf4905a3702fadedf451ea584791d233ade90965d608bac57304",
        );
        assert.is(result.balance()), "object");
});

describe("#transactions", () => {
    it("returns ok", async () => {
        nock(/.+/)
            .post("/")
            .reply(200, requireModule(`../test/fixtures/client/transactions-0.json`))
            .post("/")
            .reply(200, requireModule(`../test/fixtures/client/transactions-20.json`))
            .post("/")
            .reply(200, requireModule(`../test/fixtures/client/transactions.json`));

        const result = await subject.transactions({
            senderPublicKey:
                "aec30330deaecdd7503195a0d730256faef87027022b1bdda7ca0a61bca0a55e4d575af5a93bdf4905a3702fadedf451ea584791d233ade90965d608bac57304",
        });

        assert.is(result), "object");
    assert.is(result.items()).toBeArrayOfSize(5);
    assert.is(result.items()[0] instanceof ConfirmedTransactionData);
});
it("missing senderPublicKey", async () => {
    await assert.is(
        subject.transactions({
            identifiers: [
                {
                    type: "extendedPublicKey",
                    value: "aec30330deaecdd7503195a0d730256faef87027022b1bdda7ca0a61bca0a55e4d575af5a93bdf4905a3702fadedf451ea584791d233ade90965d608bac57304",
                },
            ],
        }),
    ).rejects.toThrow(
        "Method ClientService#transactions expects the argument [senderPublicKey] but it was not given",
    );
});
it("missing query", async () => {
    await assert.is(subject.transactions({})).rejects.toThrow(
        "Method ClientService#transactions expects the argument [senderPublicKey] but it was not given",
    );
});
    });

it("#transaction", async () => {
    nock(/.+/).post(/.*/).reply(200, requireModule(`../test/fixtures/client/transaction.json`));

    const result = await subject.transaction("35b40547f04963d3b41478fc27038948d74718802c486d9125f1884d8c83a31d");
    assert.is(result instanceof ConfirmedTransactionData);
    assert.is(result.id(), "35b40547f04963d3b41478fc27038948d74718802c486d9125f1884d8c83a31d");

    assert.is(result.blockId()), "undefined");

assert.is(result.timestamp()?.toISOString(), "2021-02-05T15:04:16.000Z");

assert.is(result.confirmations().toString(), "0");

assert.is(result.sender(),
    "addr_test1qrhvwtn8sa3duzkm93v5kjjxlv5lvg67j530wyeumngu23lk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s4s8xvh",
);

assert.is(result.recipient(),
    "addr_test1qzct2hsralem3fqn8fupu90v3jkelpg4rfp4zqx06zgevpachk6az8jcydma5a6vgsuw5c37v0c8j6rlclpqajn2vxsq3rz4th",
);

const actual = result.recipients();
assert.is(actual[0].address,
    "addr_test1qzct2hsralem3fqn8fupu90v3jkelpg4rfp4zqx06zgevpachk6az8jcydma5a6vgsuw5c37v0c8j6rlclpqajn2vxsq3rz4th",
);
assert.is(actual[0].amount.toString(), "25000000");
assert.is(actual[1].address,
    "addr_test1qzfjfm724nv9qz6nfyagmj0j2uppr35gzv5qee8s7489wxlk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33scc4thv",
);
assert.is(actual[1].amount.toString(), "4831199");

const inputs = result.inputs();
assert.is(inputs).toBeArrayOfSize(1);
assert.is(inputs[0] instanceof DTO.UnspentTransactionData);
assert.is(inputs[0].id(), "6bf76f4380da8a389ae0a7ecccf1922b74ae11d773ba8b1b761d84a1b4474a4f");
assert.is(inputs[0].amount(), BigNumber.make(30000000));
assert.is(inputs[0].address(),
    "addr_test1qrhvwtn8sa3duzkm93v5kjjxlv5lvg67j530wyeumngu23lk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33s4s8xvh",
);

const outputs = result.outputs();
assert.is(outputs).toBeArrayOfSize(2);
assert.is(outputs[0] instanceof DTO.UnspentTransactionData);
assert.is(outputs[0].amount().toString(), "25000000");
assert.is(outputs[0].address(),
    "addr_test1qzct2hsralem3fqn8fupu90v3jkelpg4rfp4zqx06zgevpachk6az8jcydma5a6vgsuw5c37v0c8j6rlclpqajn2vxsq3rz4th",
);
assert.is(outputs[1] instanceof DTO.UnspentTransactionData);
assert.is(outputs[1].amount().toString(), "4831199");
assert.is(outputs[1].address(),
    "addr_test1qzfjfm724nv9qz6nfyagmj0j2uppr35gzv5qee8s7489wxlk8ttq8f3gag0h89aepvx3xf69g0l9pf80tqv7cve0l33scc4thv",
);

assert.is(result.amount().toString(), "25000000");

assert.is(result.fee().toString(), "168801");
});

describe("#broadcast", () => {
    it("#accepted", async () => {
        nock(/.+/)
            .post("/")
            .reply(200, requireModule(`../test/fixtures/transaction/transactions-page-1.json`))
            .post("/")
            .reply(200, requireModule(`../test/fixtures/transaction/transactions-page-2.json`))
            .post("/")
            .reply(200, requireModule(`../test/fixtures/transaction/utxos.json`))
            .post("/")
            .reply(200, requireModule(`../test/fixtures/transaction/expiration.json`))
            .post("/")
            .reply(201, requireModule(`../test/fixtures/transaction/submit-tx.json`));

        const txService = createService(TransactionService, undefined, (container) => {
            container.constant(IoC.BindingType.Container, container);
            container.singleton(IoC.BindingType.ClientService, ClientService);
            container.constant(IoC.BindingType.DataTransferObjects, {
                SignedTransactionData,
                ConfirmedTransactionData,
                WalletData,
            });
            container.singleton(
                IoC.BindingType.DataTransferObjectService,
                Services.AbstractDataTransferObjectService,
            );
        });

        const transfer = await txService.transfer({
            signatory: new Signatories.Signatory(
                new Signatories.MnemonicSignatory({
                    signingKey:
                        "excess behave track soul table wear ocean cash stay nature item turtle palm soccer lunch horror start stumble month panic right must lock dress",
                    address:
                        "aec30330deaecdd7503195a0d730256faef87027022b1bdda7ca0a61bca0a55e4d575af5a93bdf4905a3702fadedf451ea584791d233ade90965d608bac57304",
                    publicKey: "publicKey",
                    privateKey: "privateKey",
                }),
            ),
            data: {
                amount: 1,
                to: "addr_test1qpgs3nex8wvaggzx9pnwjgh946e7zk3k8vc9lnf4jrk5fs4u9m4778wzj4rhddna0s2tszgz9neja69f4q6xwp2w6wqsnfunm6",
            },
        });

        const transactions = [transfer];
        const result = await subject.broadcast(transactions);
        assert.is(result).toMatchObject({
            accepted: ["a190c2c349983eda75bf0e31dc1b84b7fc08462416d9e7a1ac6d780ce2e5b568"],
            rejected: [],
            errors: {},
        });
    });
    it("#rejected", async () => {
        nock(/.+/).post("/").reply(201, requireModule(`../test/fixtures/transaction/submit-tx-failed.json`));

        const transactions = [
            createService(SignedTransactionData).configure(
                "35e95e8851fb6cc2fadb988d0a6e514386ac7a82a0d40baca34d345740e9657f",
                {
                    sender: "addr_test1qpz03ezdyda8ag724zp3n5fqulay02dp7j9mweyeylcaapsxu2hyfhlkwuxupa9d5085eunq2qywy7hvmvej456flknscw3xw7",
                    recipient:
                        "addr_test1qpz03ezdyda8ag724zp3n5fqulay02dp7j9mweyeylcaapsxu2hyfhlkwuxupa9d5085eunq2qywy7hvmvej456flknscw3xw7",
                    amount: "1000000",
                    fee: "168273",
                },
                "83a4008182582022e6ff48fc1ed9d8ed87eb416b1c45e93b5945a3dc31d7d14ccdeb93174251f40001828258390044f8e44d237a7ea3caa88319d120e7fa47a9a1f48bb7649927f1de8606e2ae44dff6770dc0f4ada3cf4cf2605008e27aecdb332ad349fda71a000f42408258390044f8e44d237a7ea3caa88319d120e7fa47a9a1f48bb7649927f1de8606e2ae44dff6770dc0f4ada3cf4cf2605008e27aecdb332ad349fda71a3888e035021a00029151031a0121e3e0a10081825820cf779aa32f35083707808532471cb64ee41426c9bbd46134dac2ac5b2a0ec0e95840fecc6f5e8fbe05a00c60998476a9102463311ffeea5b890b3bbbb0a3c933a420ff50d9a951b11ca36a491eef32d164abf21fde26d53421ce68aff2d17372a20cf6",
            ),
        ];
        const result = await subject.broadcast(transactions);
        assert.is(result).toMatchObject({
            accepted: [],
            rejected: ["35e95e8851fb6cc2fadb988d0a6e514386ac7a82a0d40baca34d345740e9657f"],
            errors: {
                "35e95e8851fb6cc2fadb988d0a6e514386ac7a82a0d40baca34d345740e9657f":
                    "HTTP request returned status code 400: Response code 400 (Bad Request)",
            },
        });
    });
});

describe("unimplemented methods", () => {
    it("#wallets", async () => {
        await assert.is(subject.wallets({})).rejects.toThrow(/is not implemented./);
    });

    it("#delegate", async () => {
        await assert.is(subject.delegate("")).rejects.toThrow(/is not implemented./);
    });

    it("#delegates", async () => {
        await assert.is(subject.delegates({})).rejects.toThrow(/is not implemented./);
    });

    it("#votes", async () => {
        await assert.is(subject.votes("")).rejects.toThrow(/is not implemented./);
    });

    it("#voters", async () => {
        await assert.is(subject.voters("", {})).rejects.toThrow(/is not implemented./);
    });
});
});
