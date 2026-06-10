// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import tseslint from "typescript-eslint";
import headers from "eslint-plugin-headers";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default tseslint.config(
	// Global ignores (replaces .eslintignore / default behaviour).
	{
		ignores: [
			"**/.next/**",
			"**/out/**",
			"**/build/**",
			"**/coverage/**",
			"next-env.d.ts",
			"src/lib/urlState/jsurl2.ts",
			"jest.config.ts",
			// CommonJS build-config files were never linted under the previous
			// `eslint . --ext .ts,.tsx,.js,.jsx` scope; keep them excluded.
			"**/*.cjs",
		],
	},

	// Next.js (includes core-web-vitals) — registers React, import, jsx-a11y,
	// @next/next and @typescript-eslint plugins + the TS parser.
	...nextCoreWebVitals,

	// @typescript-eslint recommended rules (previously: extends
	// "plugin:@typescript-eslint/recommended").
	...tseslint.configs.recommended,

	// Type-aware parsing for TS files (previously: parserOptions.project override).
	{
		files: ["**/*.ts", "**/*.tsx"],
		languageOptions: {
			parserOptions: {
				project: true,
				tsconfigRootDir: __dirname,
			},
		},
	},

	// Project rules + SPDX license header (previously the "header/header" rule).
	{
		plugins: { headers },
		rules: {
			"@typescript-eslint/consistent-type-imports": [
				"warn",
				{
					prefer: "type-imports",
					fixStyle: "inline-type-imports",
				},
			],
			"@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
			"@typescript-eslint/no-require-imports": "off",
			"@typescript-eslint/no-unused-expressions": "off",
			"@typescript-eslint/no-explicit-any": "warn",
			// eslint-plugin-react-hooks v7 (pulled in by eslint-config-next 16)
			// adds React Compiler rules that did not exist under the previous
			// v14/react-hooks v4 setup. Demote the newly-surfaced ones to warnings
			// so this dependency bump stays behavior-preserving; address separately.
			"react-hooks/refs": "warn",
			"react-hooks/set-state-in-effect": "warn",
			"headers/header-format": [
				"error",
				{
					source: "string",
					style: "line",
					content: "SPDX-FileCopyrightText: (year) Dash0 Inc.\nSPDX-License-Identifier: Apache-2.0",
					patterns: {
						year: { pattern: "\\d{4}", defaultValue: String(new Date().getFullYear()) },
					},
					trailingNewlines: 2,
				},
			],
		},
	}
);
