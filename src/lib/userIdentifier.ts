// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { type NextRequest } from "next/server";

export function getUserIdentifier(req: NextRequest): string {
	return req.ip || req.headers.get("user-agent") || "unknown-client";
}
