// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it, jest, afterEach } from "@jest/globals";
import { NextRequest, NextResponse } from "next/server";
import { handleShortLinkRequest } from "./middleware";

const rewriteSpy = jest.spyOn(NextResponse, "rewrite");
const redirectSpy = jest.spyOn(NextResponse, "redirect");
const nextSpy = jest.spyOn(NextResponse, "next");

jest.mock("@upstash/redis/nodejs", () => {
	return {
		Redis: {
			fromEnv: jest.fn(() => {
				return {
					get: jest.fn(() => {
						return "https://www.otelbin.io";
					}),
				};
			}),
		},
	};
});

describe("handleShortLinkRequest", () => {
	afterEach(() => {
		redirectSpy.mockReset();
		rewriteSpy.mockReset();
		nextSpy.mockReset();
	});

	it("If the 'bot' URL parameter is set to true, it should response with rewrite the URL to '/social-preview/${shortLink}' to generate the open graph image.", async () => {
		const mockRequest = new Request("https://otelbin.io/s/1d643f1e-fd9b-4123-948c-f374d2fc923e?bot=true");
		const mockNextRequest = new NextRequest(mockRequest, {});
		await handleShortLinkRequest(mockNextRequest);
		expect(redirectSpy).toHaveBeenCalledTimes(0);
		expect(rewriteSpy).toHaveBeenCalledTimes(1);
		expect(nextSpy).toHaveBeenCalledTimes(0);
	});

	it("If the path name does not startsWith('/s') and !pathname.startsWith('/s/new'), it does not redirect or rewrite", async () => {
		const mockRequest = new Request("https://otelbin.io/SS/1d643f1e-fd9b-4123-948c-f374d2fc923e");
		const mockNextRequest = new NextRequest(mockRequest, {});
		await handleShortLinkRequest(mockNextRequest);
		expect(redirectSpy).toHaveBeenCalledTimes(0);
		expect(rewriteSpy).toHaveBeenCalledTimes(0);
		expect(nextSpy).toHaveBeenCalledTimes(1);
	});

	it("If the User-Agent in the request headers belongs to social bots in 'isBotRequest', the response should involve rewriting the URL to '/social-preview/${shortLink}' for generating the open graph image.", async () => {
		const mockRequest = new Request("https://otelbin.io/s/1d643f1e-fd9b-4123-948c-f374d2fc923e");
		const mockNextRequest = new NextRequest(mockRequest, {});
		mockNextRequest.headers.set("User-Agent", "Slackbot 1.0 (+https://api.slack.com/robots)");
		await handleShortLinkRequest(mockNextRequest);
		expect(redirectSpy).toHaveBeenCalledTimes(0);
		expect(rewriteSpy).toHaveBeenCalledTimes(1);
		expect(nextSpy).toHaveBeenCalledTimes(0);
	});

	it("If there is neither a 'bot' URL parameter nor bot User-Agent headers set in the request, the behavior should be a redirection to the full link retrieved from Redis.", async () => {
		const mockRequest = new Request("https://otelbin.io/s/1d643f1e-fd9b-4123-948c-f374d2fc923e");
		const mockNextRequest = new NextRequest(mockRequest, {});
		await handleShortLinkRequest(mockNextRequest);
		expect(redirectSpy).toHaveBeenCalledTimes(0);
		expect(rewriteSpy).toHaveBeenCalledTimes(0);
		expect(nextSpy).toHaveBeenCalledTimes(1);
	});
});
