import type { Config } from "jest";

const config: Config = {
	preset: "ts-jest",
	testEnvironment: "node",
	transform: {
		"^.+\\.ts?$": "ts-jest",
	},
	transformIgnorePatterns: ["<rootDir>/node_modules/"],
	testPathIgnorePatterns: ["packages/otelbin-validation/*", "packages/otelbin-validation-image/*"],
};

export default config;
