// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

/**
 * @jest-environment jsdom
 */

"use client";

import { jest, describe, expect, it } from "@jest/globals";
import { useServerSideValidationEnabled } from "./otelCollectorConfigValidation";
import * as useUrlStateModule from "~/lib/urlState/client/useUrlState";

jest.mock("~/lib/urlState/client/useUrlState", () => {
	return {
		useUrlState: jest.fn(() => [{ distro: "mockDistro", distroVersion: "mockVersion" }]),
	};
});

describe("useServerSideValidationEnabled", () => {
	it("should return true when distro and distroVersion are present", () => {
		const result = useServerSideValidationEnabled();

		expect(result).toBe(true);
	});

	it("should return false when either distro or distroVersion is missing", () => {
		jest
			.spyOn(useUrlStateModule, "useUrlState")
			.mockImplementation(() => [{ distro: "mockDistro", distroVersion: null }, () => "mockPath"]);

		const result = useServerSideValidationEnabled();

		expect(result).toBe(false);
	});
});
