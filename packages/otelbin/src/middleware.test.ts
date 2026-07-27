// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "@jest/globals";
import { NextRequest } from "next/server";
import { handleShortLinkRequest } from "./middleware";

const SHORT_LINK_ID = "1d643f1e-fd9b-4123-948c-f374d2fc923e";
const BOT_USER_AGENT = "Slackbot 1.0 (+https://api.slack.com/robots)";

function makeRequest(path: string, headers: Record<string, string> = {}) {
	return new NextRequest(new Request(`https://otelbin.io${path}`, { headers }), {});
}

describe("handleShortLinkRequest", () => {
	it("rewrites a bot request for /s/<id> to /s/<id>/preview", async () => {
		const response = await handleShortLinkRequest(makeRequest(`/s/${SHORT_LINK_ID}`, { "user-agent": BOT_USER_AGENT }));

		expect(response.headers.get("x-middleware-rewrite")).toBe(`https://otelbin.io/s/${SHORT_LINK_ID}/preview`);
		expect(response.headers.get("x-middleware-next")).toBeNull();
	});

	it("rewrites when the ?bot=true query parameter is set, regardless of user-agent", async () => {
		const response = await handleShortLinkRequest(makeRequest(`/s/${SHORT_LINK_ID}?bot=true`));

		expect(response.headers.get("x-middleware-rewrite")).toBe(`https://otelbin.io/s/${SHORT_LINK_ID}/preview`);
	});

	it("passes through a non-bot request for /s/<id>", async () => {
		const response = await handleShortLinkRequest(makeRequest(`/s/${SHORT_LINK_ID}`));

		expect(response.headers.get("x-middleware-next")).toBe("1");
		expect(response.headers.get("x-middleware-rewrite")).toBeNull();
	});

	it("passes through when the path does not match /s/<id>", async () => {
		const response = await handleShortLinkRequest(
			makeRequest(`/SS/${SHORT_LINK_ID}`, { "user-agent": BOT_USER_AGENT })
		);

		expect(response.headers.get("x-middleware-next")).toBe("1");
		expect(response.headers.get("x-middleware-rewrite")).toBeNull();
	});

	it("does not treat /s/new as a short-link (path has to end in the id)", async () => {
		const response = await handleShortLinkRequest(makeRequest(`/s/new/extra`, { "user-agent": BOT_USER_AGENT }));

		expect(response.headers.get("x-middleware-next")).toBe("1");
	});
});
