// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}


export const isBotRequest = (req: Request): boolean => {

	const searchParams = new URL(req.url).searchParams;
	if (searchParams.get("bot")) return true;
	const userAgent = req.headers.get("User-Agent");
	if (userAgent) {
		return /bot|teoma|yandex|baidu|WhatsApp|google|ChatGPT|bing|msn|duckduckbot|facebookexternalhit|slurp|MetaInspector/i.test(
			userAgent,
		);
	}
	return false;
};