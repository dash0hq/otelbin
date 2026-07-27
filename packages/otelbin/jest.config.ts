import { readFileSync } from "node:fs";
import type { Config } from "jest";
import { pathsToModuleNameMapper } from "ts-jest";

const { compilerOptions } = JSON.parse(readFileSync("./tsconfig.json", "utf8")) as {
	compilerOptions: { paths: Record<string, string[]> };
};

// A handful of files import from next/server, which needs Node's Request /
// Response globals. jsdom does not provide those. Route those files to a
// node-env jest project and everything else to jsdom. Doing this in config
// avoids per-file `@jest-environment` docblocks that would otherwise have to
// sit above the SPDX header (jest only honors the pragma when it is the first
// comment block in the file), which the eslint headers/header-format rule
// then flags as a header violation.
const nodeTestPaths = ["<rootDir>/src/lib/utils.test.ts", "<rootDir>/src/middleware.test.ts"];

const sharedProjectConfig = {
	preset: "ts-jest",
	transform: { "^.+\\.tsx?$": "ts-jest" },
	transformIgnorePatterns: ["<rootDir>/node_modules/"],
	moduleNameMapper: pathsToModuleNameMapper(compilerOptions.paths, { prefix: "<rootDir>/" }),
};

const config: Config = {
	projects: [
		{
			...sharedProjectConfig,
			displayName: "node",
			testEnvironment: "node",
			testMatch: nodeTestPaths,
		},
		{
			...sharedProjectConfig,
			displayName: "jsdom",
			testEnvironment: "jsdom",
			testMatch: ["<rootDir>/src/**/*.test.ts?(x)"],
			testPathIgnorePatterns: nodeTestPaths,
		},
	],
};

export default config;
