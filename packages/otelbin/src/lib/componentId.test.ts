// SPDX-FileCopyrightText: 2026 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "@jest/globals";
import { splitComponentId } from "./componentId";

describe("splitComponentId", () => {
	it("returns a type-only component ID unchanged", () => {
		expect(splitComponentId("otlp")).toEqual({ type: "otlp" });
	});

	it("separates a component type from its instance name", () => {
		expect(splitComponentId("otlp/default")).toEqual({ type: "otlp", name: "default" });
	});

	it("preserves slashes inside the instance name", () => {
		expect(splitComponentId("foo/bar/baz")).toEqual({ type: "foo", name: "bar/baz" });
		expect(splitComponentId("otlp/customer/eu-west/blue")).toEqual({
			type: "otlp",
			name: "customer/eu-west/blue",
		});
	});
});
