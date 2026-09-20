// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { type NextRequest, NextResponse } from "next/server";
import { getShortLinkPersistenceKey } from "~/lib/shortLink";
import { createRedisIfConfigured } from "~/lib/redis";

const redis = createRedisIfConfigured();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	if (!redis) {
		const url = req.nextUrl.clone();
		url.pathname = "/";
		return NextResponse.redirect(url.toString());
	}

	const shortLink = await redis.get<string>(getShortLinkPersistenceKey(id));

	if (shortLink) {
		return NextResponse.redirect(shortLink);
	}

	const url = req.nextUrl.clone();
	url.pathname = "/";

	return NextResponse.redirect(url.toString());
}
