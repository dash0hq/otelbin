// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { Redis } from "@upstash/redis/nodejs";
import type { Metadata } from "next";
import { getShortLinkPersistenceKey } from "~/lib/shortLink";
import { parse } from "~/lib/urlState/jsurl2";

const redis = Redis.fromEnv();
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
	const fullLink = (await redis.get<string>(getShortLinkPersistenceKey(params.id))) ?? "";
	const url = new URL(fullLink);
	const urlHash = url.hash;
	let parsedConfig = "";
	if (urlHash != null) {
		try {
			const config = urlHash.split("=")[1] ?? "";
			const decodedConfig = decodeURIComponent(config);
			parsedConfig = parse(decodedConfig);
		} catch (e) {
			console.warn("Failed to parse search param %s.", urlHash, e);
		}
	}

	return {
		description: parsedConfig,
		openGraph: {
			images: [
				{
					url: new URL(`/og/${params.id}`, url.origin),
					width: 1200,
					height: 630,
				},
			],
		},
	};
}

export default function SocialPage() {
	return <div className="flex justify-center items-center h-screen">Empty Page</div>;
}
