// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

/** @type {import("eslint").Linter.Config} */
const config = {
	overrides: [
		{
			// extends: [
			//   "plugin:@typescript-eslint/recommended-requiring-type-checking",
			// ],
			files: ["*.ts", "*.tsx"],
			parserOptions: {
				project: path.join(__dirname, "tsconfig.json"),
			},
		},
	],
	parser: "@typescript-eslint/parser",
	parserOptions: {
		// project: path.join(__dirname, "tsconfig.json"),
	},
	plugins: ["@typescript-eslint", "header"],
	extends: ["next/core-web-vitals", "plugin:@typescript-eslint/recommended"],
	rules: {
		"@typescript-eslint/no-explicit-any": "off",
		"@typescript-eslint/consistent-type-imports": [
			"warn",
			{
				prefer: "type-imports",
				fixStyle: "inline-type-imports",
			},
		],
		"@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
		"header/header": [
			2,
			"line",
			[
				{
					pattern: " SPDX-FileCopyrightText: \\d{4} Dash0 Inc\\.",
					template: ` SPDX-FileCopyrightText: ${new Date().getFullYear()} Dash0 Inc.`,
				},
				" SPDX-License-Identifier: Apache-2.0",
			],
			2,
		],
	},
};

module.exports = config;
