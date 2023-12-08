// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { Redis } from "@upstash/redis/nodejs";
import type { Metadata } from "next";
import { getShortLinkPersistenceKey } from "~/lib/shortLink";
import { parse } from "~/lib/urlState/jsurl2";

const redis = Redis.fromEnv();
const width = 1200;
const height = 630;
const ogImageAlt = "OpenTelemetry collector configuration pipeline visualization by OTelBin";
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
	const imagesUrl = new URL(`/og/${params.id}`, url.origin);

	return {
		description: parsedConfig,
		openGraph: {
			images: [
				{
					url: imagesUrl,
					width: width,
					height: height,
					alt: ogImageAlt,
				},
			],
		},
		twitter: {
			title: "OTelBin – by Dash0",
			site: "@dash0hq",
			images: [
				{
					url: imagesUrl,
					width: width,
					height: height,
					alt: ogImageAlt,
				},
			],
		},
	};
}

export default function SocialPage() {
	return <div className="flex justify-center items-center h-screen">Empty Page</div>;
}
