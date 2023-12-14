// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "@jest/globals";
import { isBotRequest } from "./utils";
import { NextRequest } from "next/server";

describe("isBotRequest", () => {
	it("should return true for user-agent bot requests", () => {
		const mockRequest = new Request("https://www.whatever.com/admin/check-it-out");
		const mockNextRequest = new NextRequest(mockRequest, {});
		mockNextRequest.headers.set("User-Agent", "Slackbot 1.0 (+https://api.slack.com/robots)");

		const result = isBotRequest(mockNextRequest);

		expect(result).toBe(true);
	});

	it("should return true for url param ?bot=true requests", () => {
		const mockRequest = new Request("https://www.whatever.com/admin/check-it-out?bot=true");
		const mockNextRequest = new NextRequest(mockRequest, {});

		const result = isBotRequest(mockNextRequest);

		expect(result).toBe(true);
	});

	it("should return true for url param ?bot=false requests", () => {
		const mockRequest = new Request("https://www.whatever.com/admin/check-it-out?bot=false");
		const mockNextRequest = new NextRequest(mockRequest, {});

		const result = isBotRequest(mockNextRequest);

		expect(result).toBe(true);
	});

	it("should return false for non-bot requests", () => {
		const mockRequest = new Request("https://www.whatever.com/admin/check-it-out");
		const mockNextRequest = new NextRequest(mockRequest, {});
		mockNextRequest.headers.set(
			"User-Agent",
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.3029.110 Safari/537"
		);

		const result = isBotRequest(mockNextRequest);

		expect(result).toBe(false);
	});
});
