
import { createService } from "../test/mocking";
import { AssetSerializer } from "./asset.serializer";

describe("AssetSerializer #toMachine", () => {
	it.each([
		{
			moduleID: 2,
			assetID: 0,
			asset: { recipientAddress: "lsk72fxrb264kvw6zuojntmzzsqds35sqvfzz76d7", amount: "100000000" },
		},
		{
			moduleID: 4,
			assetID: 0,
			asset: {
				numberOfSignatures: 2,
				mandatoryKeys: [
					"5948cc0565a3e9320c7442cecb62acdc92b428a0da504c52afb3e84a025d221f",
					"a3c22fd67483ae07134c93224384dac7206c40b1b7a14186dd2d3f0dcc8234ff",
				],
				optionalKeys: [],
			},
		},
		{
			moduleID: 5,
			assetID: 0,
			asset: { username: "johndoe" },
		},
		{
			moduleID: 5,
			assetID: 1,
			asset: { votes: [{ delegateAddress: "lsk72fxrb264kvw6zuojntmzzsqds35sqvfzz76d7", amount: `${10e8}` }] },
		},
		{
			moduleID: 5,
			assetID: 2,
			asset: {
				unlockObjects: [
					{
						delegateAddress: "lsk72fxrb264kvw6zuojntmzzsqds35sqvfzz76d7",
						amount: `${10e8}`,
						unvoteHeight: "1",
					},
				],
			},
		},
	])("should serialize asset of transaction type (%s)", ({ moduleID, assetID, asset }) => {
		expect(createService(AssetSerializer).toMachine(moduleID, assetID, asset)).toMatchSnapshot();
	});

	it("should throw error when transaction type cannot be recognized", () => {
		expect(() => createService(AssetSerializer).toMachine(10, 10, {})).toThrow(
			"Failed to determine transaction type for asset serialization.",
		);
	});

	it("should throw error when serializing vote asset with amount not multiple of 10", () => {
		expect(() =>
			createService(AssetSerializer).toMachine(5, 1, {
				votes: [{ delegateAddress: "lsk72fxrb264kvw6zuojntmzzsqds35sqvfzz76d7", amount: `${7 * 1e8}` }],
			}),
		).toThrow("The value [700000000] is not a multiple of 10.");
	});
});
