// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { type NextRequest, NextResponse } from "next/server";
import { isBotRequest } from "./lib/utils";

const isCreateNewRoute = createRouteMatcher(["/s/new"]);

export default clerkMiddleware(async (auth, request) => {
	if (isCreateNewRoute(request)) await auth.protect();

	return handleShortLinkRequest(request);
});

export const config = {
	matcher: ["/s/(.*)"],
};

export async function handleShortLinkRequest(request: NextRequest) {
	const shortLinkRegExp = /\/s\/([^/]+)$/;
	const match = request.nextUrl.pathname.match(shortLinkRegExp);
	if (match?.[1] && isBotRequest(request)) {
		const shortLinkID = match[1];
		return NextResponse.rewrite(new URL(`/s/${shortLinkID}/preview`, request.url));
	} else {
		return NextResponse.next();
	}
}
