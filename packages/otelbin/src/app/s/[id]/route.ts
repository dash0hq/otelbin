// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { type NextRequest, NextResponse } from "next/server";
import { getShortLinkPersistenceKey } from "~/lib/shortLink";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const shortLink = await redis.get<string>(getShortLinkPersistenceKey(id));

	if (shortLink) {
		return NextResponse.redirect(shortLink);
	}

	const url = req.nextUrl.clone();
	url.pathname = "/";

	return NextResponse.redirect(url.toString());
}
