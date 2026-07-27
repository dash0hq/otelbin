// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

/**
 * Build the { prefix, name, fallback } binding shape used by the URL-state
 * hooks, wrapping a YAML string with the trim + tab-to-two-spaces normalization
 * that both existing tests and the production editorBinding apply.
 *
 * Fixture content stays inline in each test file: many tests assert on byte
 * offsets inside the YAML, so a shared fixture would tightly couple otherwise
 * independent tests to the same string.
 */
export function configBinding(fallback: string) {
	return {
		prefix: "",
		name: "config",
		fallback: fallback.trim().replaceAll(/\t/g, "  "),
	} as const;
}
