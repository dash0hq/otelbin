// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { NextResponse } from "next/server";
import { notFound } from "next/navigation";

export function GET(): NextResponse {
	if (process.env.NEXT_PUBLIC_TERMS_AND_CONDITIONS_URL) {
		return NextResponse.redirect(process.env.NEXT_PUBLIC_TERMS_AND_CONDITIONS_URL);
	}
	notFound();
}
