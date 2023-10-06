// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { type NextRequest, NextResponse } from "next/server";
import { getUserIdentifier } from "~/lib/userIdentifier";
import { assertValue } from "~/lib/env";

const allowedCharacters = /^[a-z0-9.\-_]+$/i;

const redis = Redis.fromEnv();

const rateLimit = new Ratelimit({
	redis,
	limiter: Ratelimit.slidingWindow(30, "1 m"),
	analytics: true,
	prefix: "rate-limit-validate",
});

export async function POST(request: NextRequest): Promise<NextResponse> {
	const distro = request.nextUrl.searchParams.get("distro");
	const version = request.nextUrl.searchParams.get("version");

	if (distro == null || !allowedCharacters.test(distro) || version == null || !allowedCharacters.test(version)) {
		return NextResponse.json(
			{
				error:
					'API requires a "distro" and a "version" search parameter matching this regular expression: ' +
					allowedCharacters,
			},
			{
				status: 400,
			}
		);
	}

	const config = await request.text();

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

	const response = await fetch(
		`${assertValue(
			process.env.COLLECTOR_CONFIGURATION_VALIDATION_URL,
			"COLLECTOR_CONFIGURATION_VALIDATION_URL env var is not configured"
		)}/validation/${encodeURIComponent(distro)}/${encodeURIComponent(version)}`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/yaml",
				Accept: "application/json",
				"X-API-KEY": assertValue(
					process.env.COLLECTOR_CONFIGURATION_VALIDATION_API_KEY,
					"COLLECTOR_CONFIGURATION_VALIDATION_API_KEY env var is not configured"
				),
			},
			body: config,
		}
	);

	const body = await response.json();
	return NextResponse.json(body, {
		status: response.status,
	});
}
