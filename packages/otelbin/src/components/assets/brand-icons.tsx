// SPDX-FileCopyrightText: 2025 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

// lucide-react 1.0 removed every brand icon from the set, so `Github` and `Slack` are no longer
// importable from "lucide-react". The node data below is lucide's own (ISC licensed), rebuilt with
// the still-exported `createLucideIcon` so these keep the exact lucide component API: `size`,
// `color`, `strokeWidth`, and the usual SVG props all behave as before.

import { createLucideIcon } from "lucide-react";

export const Github = createLucideIcon("Github", [
	[
		"path",
		{
			d: "M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4",
			key: "tonef",
		},
	],
	["path", { d: "M9 18c-4.51 2-5-2-7-2", key: "9comsn" }],
]);

export const Slack = createLucideIcon("Slack", [
	["rect", { width: "3", height: "8", x: "13", y: "2", rx: "1.5", key: "diqz80" }],
	["path", { d: "M19 8.5V10h1.5A1.5 1.5 0 1 0 19 8.5", key: "183iwg" }],
	["rect", { width: "3", height: "8", x: "8", y: "14", rx: "1.5", key: "hqg7r1" }],
	["path", { d: "M5 15.5V14H3.5A1.5 1.5 0 1 0 5 15.5", key: "76g71w" }],
	["rect", { width: "8", height: "3", x: "14", y: "13", rx: "1.5", key: "1kmz0a" }],
	["path", { d: "M15.5 19H14v1.5a1.5 1.5 0 1 0 1.5-1.5", key: "jc4sz0" }],
	["rect", { width: "8", height: "3", x: "2", y: "8", rx: "1.5", key: "1omvl4" }],
	["path", { d: "M8.5 5H10V3.5A1.5 1.5 0 1 0 8.5 5", key: "16f3cl" }],
]);
