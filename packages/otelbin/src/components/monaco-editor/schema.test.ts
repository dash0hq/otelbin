// SPDX-FileCopyrightText: 2026 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "@jest/globals";
import schema from "./schema.json";

// schema.json is the JSON Schema handed to monaco-yaml, which is what produces the
// "Property <name> is not allowed" markers in the editor. Every component section closes
// itself with `additionalProperties: false`, so a component is only accepted if it is listed
// under `properties` or matches one of the `patternProperties`.
const SECTIONS = ["receivers", "processors", "exporters", "extensions", "connectors"] as const;

interface Section {
	properties?: Record<string, unknown>;
	patternProperties?: Record<string, unknown>;
}

function section(name: (typeof SECTIONS)[number]): Section {
	return (schema as { properties: Record<string, Section> }).properties[name] as Section;
}

function accepts(name: (typeof SECTIONS)[number], key: string): boolean {
	const { properties = {}, patternProperties = {} } = section(name);
	if (Object.hasOwn(properties, key)) {
		return true;
	}
	return Object.keys(patternProperties).some((pattern) => new RegExp(pattern).test(key));
}

describe.each(SECTIONS)("schema.json %s", (name) => {
	// A collector component may be declared bare (`otlp:`) or as a named instance
	// (`otlp/second:`). The two are spelled differently in the schema -- `properties` covers the
	// bare name, `patternProperties` covers the named instances -- and the connectors section
	// used to list several components without the matching pattern, so `count/count_1` was
	// rejected while `count` was fine.
	it("accepts a named instance of every component it declares", () => {
		const declared = Object.keys(section(name).properties ?? {})
			// Not a component: an `additionalProperties` key leaked into `properties` in several
			// sections of the vendored schema.
			.filter((component) => component !== "additionalProperties");

		expect(declared.length).toBeGreaterThan(0);
		expect(declared.filter((component) => !accepts(name, `${component}/instance`))).toEqual([]);
	});

	it("still rejects unknown components", () => {
		expect(accepts(name, "definitely_not_a_real_component")).toBe(false);
	});
});

describe("schema.json connectors", () => {
	it.each(["forward", "count", "exceptions", "routing", "spanmetrics", "servicegraph", "datadog"])(
		"accepts the %s connector bare and named",
		(connector) => {
			expect(accepts("connectors", connector)).toBe(true);
			expect(accepts("connectors", `${connector}/named`)).toBe(true);
		}
	);

	it("does not accept a component whose name merely starts with a known connector", () => {
		expect(accepts("connectors", "forwardx")).toBe(false);
	});
});
