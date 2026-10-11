// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "@jest/globals";
import { bindEnvVars, findSubstitutions, findValidationBlockers } from "./envVars";

describe("findSubstitutions", () => {
	it("finds no substitution in a configuration without one", () => {
		const { envVars, unsupportedProviders, invalid } = findSubstitutions("exporters:\n  otlp:\n    endpoint: :4317\n");

		expect(envVars).toEqual({});
		expect(unsupportedProviders).toEqual([]);
		expect(invalid).toEqual([]);
	});

	it("detects the explicit env scheme", () => {
		const { envVars } = findSubstitutions("endpoint: ${env:OTLP_ENDPOINT}");

		expect(Object.keys(envVars)).toEqual(["OTLP_ENDPOINT"]);
		expect(envVars.OTLP_ENDPOINT?.occurrences).toEqual([
			{ source: "${env:OTLP_ENDPOINT}", line: 1, defaultValue: undefined },
		]);
	});

	it("treats a substitution without a scheme as the env scheme", () => {
		const { envVars } = findSubstitutions("endpoint: ${OTLP_ENDPOINT}");

		expect(Object.keys(envVars)).toEqual(["OTLP_ENDPOINT"]);
		expect(envVars.OTLP_ENDPOINT?.occurrences[0]?.defaultValue).toBeUndefined();
	});

	it("does not detect bash-style substitutions, which the collector no longer expands", () => {
		const { envVars, invalid } = findSubstitutions("endpoint: $OTLP_ENDPOINT");

		expect(envVars).toEqual({});
		expect(invalid).toEqual([]);
	});

	it("ignores $$, which escapes a literal dollar sign", () => {
		const { envVars, invalid } = findSubstitutions("replacement: $${not_a_var}");

		expect(envVars).toEqual({});
		expect(invalid).toEqual([]);
	});

	it("still detects a substitution following an escaped dollar sign", () => {
		const { envVars } = findSubstitutions("value: $$ and ${FOO}");

		expect(Object.keys(envVars)).toEqual(["FOO"]);
	});

	it("extracts default values declared with the bash separator", () => {
		const { envVars } = findSubstitutions("a: ${env:FOO:-http://localhost:4317}\nb: ${BAR:-}");

		expect(envVars.FOO?.occurrences[0]?.defaultValue).toBe("http://localhost:4317");
		expect(envVars.BAR?.occurrences[0]?.defaultValue).toBe("");
	});

	it("splits on the first default separator only", () => {
		const { envVars } = findSubstitutions("a: ${env:FOO:-x:-y}");

		expect(envVars.FOO?.occurrences[0]?.defaultValue).toBe("x:-y");
	});

	it("groups repeated references to the same variable and records their lines", () => {
		const config = ["exporters:", "  otlp:", "    endpoint: ${FOO}", "  otlphttp:", "    endpoint: ${env:FOO:-x}"].join(
			"\n"
		);

		const { envVars } = findSubstitutions(config);

		expect(envVars.FOO?.occurrences).toEqual([
			{ source: "${FOO}", line: 3, defaultValue: undefined },
			{ source: "${env:FOO:-x}", line: 5, defaultValue: "x" },
		]);
	});

	it("reports providers that cannot be resolved during validation", () => {
		const config = "a: ${file:/etc/otel/secret}\nb: ${http://example.com/c.yaml}\nc: ${yaml:{k: v}}";

		const { envVars, unsupportedProviders } = findSubstitutions(config);

		expect(envVars).toEqual({});
		expect(unsupportedProviders).toEqual([
			{ scheme: "file", source: "${file:/etc/otel/secret}", line: 1 },
			{ scheme: "http", source: "${http://example.com/c.yaml}", line: 2 },
			{ scheme: "yaml", source: "${yaml:{k: v}", line: 3 },
		]);
	});

	it("reports substitutions whose variable name the collector would reject", () => {
		const { envVars, invalid } = findSubstitutions("a: ${1FOO}\nb: ${}\nc: ${FOO-BAR}");

		expect(envVars).toEqual({});
		expect(invalid).toEqual([
			{ source: "${1FOO}", line: 1 },
			{ source: "${}", line: 2 },
			{ source: "${FOO-BAR}", line: 3 },
		]);
	});
});

describe("bindEnvVars", () => {
	it("marks a variable referenced without a default and without a value as unbound", () => {
		const { envVars } = findSubstitutions("a: ${FOO}");

		const bindings = bindEnvVars(envVars, {});

		expect(bindings.FOO?.isUnbound).toBe(true);
		expect(bindings.FOO?.boundValue).toBeUndefined();
		expect(bindings.FOO?.defaultValues).toEqual([]);
	});

	it("marks a variable as bound once the user supplies a value", () => {
		const { envVars } = findSubstitutions("a: ${FOO}");

		expect(bindEnvVars(envVars, { FOO: "bar" }).FOO?.isUnbound).toBe(false);
	});

	it("treats an empty string as a value the user supplied", () => {
		const { envVars } = findSubstitutions("a: ${FOO}");

		expect(bindEnvVars(envVars, { FOO: "" }).FOO?.isUnbound).toBe(false);
	});

	it("does not require a value when every occurrence declares a default", () => {
		const { envVars } = findSubstitutions("a: ${env:FOO:-x}\nb: ${FOO:-y}");

		const binding = bindEnvVars(envVars, {}).FOO;

		expect(binding?.isUnbound).toBe(false);
		expect(binding?.defaultValues).toEqual(["x", "y"]);
	});

	it("requires a value when only some occurrences declare a default", () => {
		const { envVars } = findSubstitutions("a: ${env:FOO:-x}\nb: ${FOO}");

		expect(bindEnvVars(envVars, {}).FOO?.isUnbound).toBe(true);
	});

	it("de-duplicates repeated default values", () => {
		const { envVars } = findSubstitutions("a: ${FOO:-x}\nb: ${FOO:-x}");

		expect(bindEnvVars(envVars, {}).FOO?.defaultValues).toEqual(["x"]);
	});
});

describe("findValidationBlockers", () => {
	it("reports nothing when every variable resolves", () => {
		const { envVars, unsupportedProviders } = findSubstitutions("a: ${FOO:-x}");

		expect(findValidationBlockers(bindEnvVars(envVars, {}), unsupportedProviders)).toEqual([]);
	});

	it("reports unbound variables", () => {
		const { envVars, unsupportedProviders } = findSubstitutions("a: ${FOO}\nb: ${BAR}");

		expect(findValidationBlockers(bindEnvVars(envVars, {}), unsupportedProviders)).toEqual([
			"2 environment variables are unbound: FOO, BAR",
		]);
	});

	it("uses the singular for a single unbound variable", () => {
		const { envVars, unsupportedProviders } = findSubstitutions("a: ${FOO}");

		expect(findValidationBlockers(bindEnvVars(envVars, {}), unsupportedProviders)).toEqual([
			"1 environment variable is unbound: FOO",
		]);
	});

	it("reports each unresolvable provider once", () => {
		const { envVars, unsupportedProviders } = findSubstitutions("a: ${file:/a}\nb: ${file:/b}\nc: ${http://c}");

		expect(findValidationBlockers(bindEnvVars(envVars, {}), unsupportedProviders)).toEqual([
			"The file:, http: providers cannot be resolved during validation",
		]);
	});

	it("reports unbound variables and unresolvable providers together", () => {
		const { envVars, unsupportedProviders } = findSubstitutions("a: ${FOO}\nb: ${file:/a}");

		expect(findValidationBlockers(bindEnvVars(envVars, {}), unsupportedProviders)).toEqual([
			"1 environment variable is unbound: FOO",
			"The file: provider cannot be resolved during validation",
		]);
	});
});
