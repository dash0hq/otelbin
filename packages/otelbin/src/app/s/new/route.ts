// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import * as crypto from "crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { type NextRequest, NextResponse } from "next/server";
import { getShortLinkPersistenceKey } from "~/lib/shortLink";
import { getUserIdentifier } from "~/lib/userIdentifier";
import { isClerkConfigured } from "~/lib/capabilities";
import { createRedisIfConfigured } from "~/lib/redis";

const redis = createRedisIfConfigured();

const rateLimit = redis
	? new Ratelimit({
			redis,
			limiter: Ratelimit.slidingWindow(10, "1 m"),
			analytics: true,
			prefix: "rate-limit-short-links",
		})
	: undefined;

export async function POST(request: NextRequest): Promise<NextResponse> {
	if (!isClerkConfigured() || !redis || !rateLimit) {
		return NextResponse.json(
			{
				error: "Short links are not configured on this OTelBin instance",
			},
			{
				status: 503,
			}
		);
	}

	const longURL = await request.text();
	if (!longURL) {
		return NextResponse.json(
			{
				error: "Missing url search parameter",
			},
			{
				status: 400,
			}
		);
	}

	if (longURL.length > 50000) {
		return NextResponse.json(
			{
				error: "URL is too long",
			},
			{
				status: 400,
			}
		);
	}

	const userIdentifier = getUserIdentifier(request);
	const { success } = await rateLimit.blockUntilReady(userIdentifier, 1000 * 60);
	if (!success) {
		return NextResponse.json(
			{
				error: "Rate limit exceeded",
			},
			{
				status: 429,
			}
		);
	}

	const id = crypto.createHash("sha1").update(longURL).digest("hex");
	await redis.set(getShortLinkPersistenceKey(id), longURL);

	const shortURL = new URL(`/s/${id}`, request.nextUrl.origin);
	return NextResponse.json(
		{
			shortLink: shortURL.href,
			imgURL: `${shortURL.href}/img`,
		},
		{
			headers: {
				"Cache-Control": "public, max-age=3600, stale-while-revalidate=3600, stale-if-error=3600",
			},
		}
	);
}
