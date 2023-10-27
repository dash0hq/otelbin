// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { NextResponse } from "next/server";
import { getShortLinkPersistenceKey } from "~/lib/shortLink";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function GET(request: Request, { params }: { params: { id: string } }) {
	const shortLink = await redis.get<string>(getShortLinkPersistenceKey(params.id));
	return NextResponse.redirect(shortLink || "/", {
		headers: {
			"Cache-Control": "public, max-age=3600, stale-while-revalidate=3600, stale-if-error=3600",
		},
	});
}
