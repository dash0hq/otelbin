// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "@jest/globals";
import { getAppCapabilities, isClerkConfigured, isUpstashConfigured } from "./capabilities";

describe("integration capabilities", () => {
	it("disables external-service features when no credentials are configured", () => {
		expect(getAppCapabilities({})).toEqual({
			auth: false,
			shortLinks: false,
		});
	});

	it("requires both Clerk values before enabling authentication", () => {
		expect(isClerkConfigured({ NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test" })).toBe(false);
		expect(isClerkConfigured({ CLERK_SECRET_KEY: "sk_test" })).toBe(false);
		expect(
			isClerkConfigured({
				NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test",
				CLERK_SECRET_KEY: "sk_test",
			})
		).toBe(true);
	});

	it("requires both Upstash values", () => {
		expect(isUpstashConfigured({ UPSTASH_REDIS_REST_URL: "https://example.upstash.io" })).toBe(false);
		expect(
			isUpstashConfigured({
				UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
				UPSTASH_REDIS_REST_TOKEN: "token",
			})
		).toBe(true);
	});

	it("enables short links only when Clerk and Upstash are both configured", () => {
		expect(
			getAppCapabilities({
				NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: "pk_test",
				CLERK_SECRET_KEY: "sk_test",
				UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
				UPSTASH_REDIS_REST_TOKEN: "token",
			})
		).toEqual({
			auth: true,
			shortLinks: true,
		});
	});
});
