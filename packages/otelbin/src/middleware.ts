// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { authMiddleware } from "@clerk/nextjs";
import { Redis } from "@upstash/redis/nodejs";
import { type NextRequest, NextResponse } from "next/server";
import { getShortLinkPersistenceKey } from "./lib/shortLink";
import { isBotRequest } from "~/lib/utils";

export default authMiddleware({
	apiRoutes: ["/s/new"],
});

export const config = {
	matcher: ["/s/(.*)"],
};

const redis = Redis.fromEnv();

export async function middleware(request: NextRequest) {

	if (request.nextUrl.pathname.startsWith('/s') && !request.nextUrl.pathname.startsWith('/s/new')) {
		const shortLink = request.url.split("/")[request.url.split("/").length - 1] ?? "";
		const fullLink = await redis.get<string>(getShortLinkPersistenceKey(shortLink));

		if (isBotRequest(request)) {
			return NextResponse.rewrite(`${process.env.DEPLOYMENT_ORIGIN}/social-preview/${shortLink}`)
		} else {
			return NextResponse.redirect(fullLink || "/", {
				headers: {
					"Cache-Control": "public, max-age=3600, stale-while-revalidate=3600, stale-if-error=3600",
				},
			});
		}
	}


}