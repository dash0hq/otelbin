// SPDX-FileCopyrightText: 2024 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { type NextRequest, NextResponse } from "next/server";
import { serializeUrlState } from "~/lib/urlState/serializeUrlState";
import { editorBinding } from "~/components/monaco-editor/editorBinding";

export const runtime = "edge";

export function OPTIONS(request: NextRequest): NextResponse {
	return new NextResponse(null, {
		status: 200,
		headers: getCorsHeaders(request),
	});
}

export async function POST(request: NextRequest): Promise<NextResponse> {
	const body = await request.text();
	const emptyParams = new URLSearchParams();
	const pathName = serializeUrlState([editorBinding], "/", emptyParams, emptyParams, {
		[editorBinding.name]: body,
	});
	const url = new URL(pathName, request.nextUrl).toString();
	return new NextResponse(url, {
		status: 200,
		headers: {
			...getCorsHeaders(request),
			Location: url,
		},
	});
}

function getCorsHeaders(request: NextRequest) {
	return {
		"Access-Control-Allow-Origin": request.headers.get("Origin") || "*",
		"Access-Control-Allow-Methods": "POST, OPTIONS",
		"Access-Control-Allow-Headers": "Content-Type",
	};
}
