// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { authMiddleware } from "@clerk/nextjs";
import { type NextRequest, NextResponse } from "next/server";
import { isBotRequest } from "./lib/utils";

export default authMiddleware({
	apiRoutes: ["/s/new"],
	publicRoutes: (req) => req.nextUrl.pathname !== "/s/new",
	afterAuth(_, request: NextRequest) {
		return handleShortLinkRequest(request);
	},
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
