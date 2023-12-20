// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { NextResponse } from "next/server";
import { getShortLinkPersistenceKey } from "~/lib/shortLink";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export async function GET(_: Request, { params }: { params: { id: string } }) {
	const shortLink = await redis.get<string>(getShortLinkPersistenceKey(params.id));
	return NextResponse.redirect(shortLink || "/");
}
