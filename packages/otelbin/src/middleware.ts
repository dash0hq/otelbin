// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { authMiddleware } from "@clerk/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import { isBotRequest } from "./lib/utils";
import { notFound } from "next/navigation";

export default authMiddleware({
	apiRoutes: ["/s/new"],
	publicRoutes: ["/s/:id"],
	afterAuth(auth, request: NextRequest) {
		return handleShortLinkRequest(request);
	},
});

export const config = {
	matcher: ["/s/(.*)"],
};

export async function handleShortLinkRequest(request: NextRequest) {
	if (request.nextUrl.pathname.startsWith("/s") && !request.nextUrl.pathname.startsWith("/s/new")) {
		const match = request.url.match(/\/s\/([^/]+)$/);
		const shortLink = match ? match[1] : "";

		if (!shortLink) {
			return notFound();
		}

		if (isBotRequest(request)) {
			return NextResponse.rewrite(new URL(`/social-preview/${shortLink}`, request.url));
		} else {
			return NextResponse.next();
		}
	} else {
		return NextResponse.next();
	}
}
