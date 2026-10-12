// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "@jest/globals";
import { bindEnvVars, findSubstitutions, findValidationBlockers, renderSubstitutions } from "./envVars";

/** Renders `config` with the values the user bound, as the editor does. */
function render(config: string, boundValues: Record<string, string> = {}) {
	const { envVars, ranges } = findSubstitutions(config);
	return renderSubstitutions(config, ranges, bindEnvVars(envVars, boundValues));
}

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

	it("ignores a substitution in a comment, which never reaches the resolver", () => {
		const config = ["# remember to set ${env:NOTE} first", "exporters:", "  otlp:", "    endpoint: otelcol:4317"].join(
			"\n"
		);

		const { envVars } = findSubstitutions(config);

		expect(envVars).toEqual({});
	});

	it("ignores a substitution in a mapping key, which the collector copies through untouched", () => {
		const { envVars } = findSubstitutions("endp${KEY}int:\n  endpoint: otelcol:4317");

		expect(envVars).toEqual({});
	});

	it("detects a substitution embedded in a value", () => {
		const { envVars } = findSubstitutions("endpoint: endp${SOZ}int");

		expect(Object.keys(envVars)).toEqual(["SOZ"]);
	});

	it("detects a substitution in a quoted value", () => {
		const { envVars } = findSubstitutions('authorization: "${env:TOKEN}"');

		expect(Object.keys(envVars)).toEqual(["TOKEN"]);
	});

	it("detects a substitution in a sequence item", () => {
		const { envVars } = findSubstitutions('receivers: ["${env:RECEIVER}", otlp]');

		expect(Object.keys(envVars)).toEqual(["RECEIVER"]);
	});

	it("falls back to accepting every substitution when the configuration does not parse", () => {
		// The tab makes this invalid YAML, as happens routinely mid-edit.
		const { envVars } = findSubstitutions("exporters:\n\tendpoint: ${env:HOST}");

		expect(Object.keys(envVars)).toEqual(["HOST"]);
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

	it("does not require a value when only some occurrences declare a default", () => {
		const { envVars } = findSubstitutions("a: ${env:FOO:-x}\nb: ${FOO}");

		expect(bindEnvVars(envVars, {}).FOO?.isUnbound).toBe(false);
	});

	it("treats an empty default as a value", () => {
		const { envVars } = findSubstitutions("a: ${FOO:-}");

		expect(bindEnvVars(envVars, {}).FOO?.isUnbound).toBe(false);
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

describe("renderSubstitutions", () => {
	it("renders nothing for a configuration without substitutions", () => {
		expect(render("endpoint: otelcol:4317")).toEqual([]);
	});

	it("renders a bound value in place of the substitution", () => {
		expect(render("endpoint: ${env:HOST}", { HOST: "otelcol:4317" })).toEqual([
			{ line: 1, text: "endpoint: otelcol:4317" },
		]);
	});

	it("falls back to the declared default when nothing is bound", () => {
		expect(render("endpoint: ${HOST:-localhost:4317}")).toEqual([{ line: 1, text: "endpoint: localhost:4317" }]);
	});

	it("prefers the bound value over the declared default", () => {
		expect(render("endpoint: ${env:HOST:-localhost}", { HOST: "otelcol" })).toEqual([
			{ line: 1, text: "endpoint: otelcol" },
		]);
	});

	it("renders every substitution on a line", () => {
		expect(render("endpoint: ${HOST}:${PORT}", { HOST: "otelcol", PORT: "4317" })).toEqual([
			{ line: 1, text: "endpoint: otelcol:4317" },
		]);
	});

	it("leaves a substitution without a value verbatim", () => {
		expect(render("endpoint: ${HOST}:${PORT}", { HOST: "otelcol" })).toEqual([
			{ line: 1, text: "endpoint: otelcol:${PORT}" },
		]);
	});

	it("skips a line whose substitutions all lack a value", () => {
		expect(render("endpoint: ${HOST}")).toEqual([]);
	});

	it("leaves substitutions addressed to another provider verbatim", () => {
		expect(render("a: ${file:/ca.pem} ${HOST}", { HOST: "otelcol" })).toEqual([
			{ line: 1, text: "a: ${file:/ca.pem} otelcol" },
		]);
	});

	it("reports the line each rendering belongs to", () => {
		const config = [
			"receivers:",
			"  otlp:",
			"    endpoint: ${HOST}",
			"exporters:",
			"  otlp:",
			"    endpoint: ${HOST}",
		].join("\n");

		expect(render(config, { HOST: "otelcol:4317" })).toEqual([
			{ line: 3, text: "    endpoint: otelcol:4317" },
			{ line: 6, text: "    endpoint: otelcol:4317" },
		]);
	});

	it("renders an empty value as the empty string", () => {
		expect(render("endpoint: ${HOST}", { HOST: "" })).toEqual([{ line: 1, text: "endpoint: " }]);
	});

	it("ignores an escaped dollar sign", () => {
		expect(render("a: $${HOST} ${PORT}", { HOST: "x", PORT: "4317" })).toEqual([{ line: 1, text: "a: $${HOST} 4317" }]);
	});
});
