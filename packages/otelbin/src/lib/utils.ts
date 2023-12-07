// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { type ClassValue, clsx } from "clsx";
import type { NextRequest } from "next/server";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function isBotRequest(req: NextRequest): boolean {
	if (req.nextUrl.searchParams.get("bot")) {
		return true
	}
	const userAgent = req.headers.get("User-Agent");
	if (userAgent) {
		return /bot|teoma|yandex|baidu|WhatsApp|google|ChatGPT|bing|msn|duckduckbot|facebookexternalhit|TelegramBot|slurp|MetaInspector|Slackbot-LinkExpanding|Slack-ImgProxy|Slackbot/i.test(
			userAgent,
		);
	}
	return false;
}