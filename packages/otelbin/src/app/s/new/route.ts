// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { Redis } from "@upstash/redis";
import * as crypto from "crypto";
import { Ratelimit } from "@upstash/ratelimit";
import { type NextRequest, NextResponse } from "next/server";
import * as process from "process";
import { getShortLinkPersistenceKey } from "~/lib/shortLink";
import { getUserIdentifier } from "~/lib/userIdentifier";

const redis = Redis.fromEnv();

const rateLimit = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(10, "1 m"),
	analytics: true,
	prefix: "rate-limit-short-links",
});

export async function POST(request: NextRequest): Promise<NextResponse> {
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

	const uuid = crypto.randomUUID();
	await redis.set(getShortLinkPersistenceKey(uuid), longURL);

	const shortURL = `${process.env.DEPLOYMENT_ORIGIN}/s/${uuid}`;
	return NextResponse.json(
		{
			shortLink: shortURL,
		},
		{
			headers: {
				"Cache-Control": "public, max-age=3600, stale-while-revalidate=3600, stale-if-error=3600",
			},
		}
	);
}
