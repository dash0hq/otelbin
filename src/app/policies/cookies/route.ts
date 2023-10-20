// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { NextResponse } from "next/server";
import { notFound } from "next/navigation";

export function GET(): NextResponse {
	if (process.env.COOKIE_POLICY_URL) {
		return NextResponse.redirect(process.env.COOKIE_POLICY_URL);
	}
	notFound();
}
