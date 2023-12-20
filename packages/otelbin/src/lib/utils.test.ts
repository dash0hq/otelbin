// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "@jest/globals";
import { isBotRequest } from "./utils";
import { NextRequest } from "next/server";

describe("isBotRequest", () => {
	it.each([
		["https://example.com", "Slackbot 1.0 (+https://api.slack.com/robots)", true],
		["https://example.com", "Slackbot-LinkExpanding 1.0 (+https://api.slack.com/robots)", true],
		["https://example.com", "Slack-ImgProxy (+https://api.slack.com/robots)", true],
		[
			"https://example.com",
			"LinkedInBot/1.0 (compatible; Mozilla/5.0; Apache-HttpClient +http://www.linkedin.com)",
			true,
		],
		[
			"https://example.com",
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			false,
		],
		[
			"https://example.com?bot=true",
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
			true,
		],
	])("should identify requests to %s by %s as bot=%s", (url, userAgent, isBot) => {
		const req = new NextRequest(new Request(url), {});
		if (userAgent) {
			req.headers.set("User-Agent", userAgent);
		}
		expect(isBotRequest(req)).toBe(isBot);
	});
});
