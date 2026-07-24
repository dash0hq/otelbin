// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { renderHook } from "@testing-library/react";
import { stringify as encodeUrlValue } from "~/lib/urlState/jsurl2";

// next/navigation hooks require an App Router runtime; stub them so the rest of
// the URL-state pipeline (useHashSearchParams -> useUrlState -> the hook under
// test) can run for real against jsdom's window.location.
jest.mock("next/navigation", () => ({
	usePathname: () => "/",
	useSearchParams: () => new URLSearchParams(),
}));

import { useServerSideValidationEnabled } from "./otelCollectorConfigValidation";

function setUrlHash(params: Record<string, string>) {
	const hash = Object.entries(params)
		.map(([k, v]) => `${k}=${encodeUrlValue(v)}`)
		.join("&");
	window.location.hash = hash;
}

describe("useServerSideValidationEnabled", () => {
	beforeEach(() => {
		window.location.hash = "";
	});

	it("returns true when both distro and distroVersion are in the URL hash", () => {
		setUrlHash({ distro: "otelcol", distroVersion: "0.100.0" });
		const { result } = renderHook(() => useServerSideValidationEnabled());
		expect(result.current).toBe(true);
	});

	it("returns false when distroVersion is missing", () => {
		setUrlHash({ distro: "otelcol" });
		const { result } = renderHook(() => useServerSideValidationEnabled());
		expect(result.current).toBe(false);
	});

	it("returns false when distro is missing", () => {
		setUrlHash({ distroVersion: "0.100.0" });
		const { result } = renderHook(() => useServerSideValidationEnabled());
		expect(result.current).toBe(false);
	});

	it("returns false when the URL hash is empty", () => {
		const { result } = renderHook(() => useServerSideValidationEnabled());
		expect(result.current).toBe(false);
	});
});
