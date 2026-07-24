import { readFileSync } from "node:fs";
import type { Config } from "jest";
import { pathsToModuleNameMapper } from "ts-jest";

const { compilerOptions } = JSON.parse(readFileSync("./tsconfig.json", "utf8")) as {
	compilerOptions: { paths: Record<string, string[]> };
};

const config: Config = {
	preset: "ts-jest",
	testEnvironment: "node",
	transform: {
		"^.+\\.ts?$": "ts-jest",
	},
	transformIgnorePatterns: ["<rootDir>/node_modules/"],
	testPathIgnorePatterns: ["packages/otelbin-validation/*", "packages/otelbin-validation-image/*"],
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
};

export default config;
