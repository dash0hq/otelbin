// SPDX-FileCopyrightText: 2026 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, jest } from "@jest/globals";

// ParentsNode pulls in SVG assets that Jest cannot transform; FormatTag does not use it.
jest.mock("./ParentsNode", () => ({
	parentNodesConfig: [],
}));

import { FormatTag } from "./ParentNodeTag";

describe("FormatTag", () => {
	it("capitalizes a pipeline ID without an instance name", () => {
		expect(FormatTag("traces")).toBe("Traces");
	});

	it("separates a pipeline type from its instance name", () => {
		expect(FormatTag("traces/default")).toBe("Traces / default");
	});

	it("preserves slashes inside the instance name", () => {
		expect(FormatTag("traces/team/alpha")).toBe("Traces / team/alpha");
	});
});
