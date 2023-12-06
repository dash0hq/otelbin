// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { Redis } from "@upstash/redis/nodejs";
import { Metadata } from "next";
import { getShortLinkPersistenceKey } from "~/lib/shortLink";
import Page from "~/app/page";

const redis = Redis.fromEnv();
export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
	const id = params.id;
	const shortLink = (await redis.get<string>(getShortLinkPersistenceKey(params.id))) ?? "";
	const url = new URL(shortLink);

	return {
		description: shortLink,
		openGraph: {
			images: [
				{
					url: "../../og",
					width: 1200,
					height: 630,
				},
			],
		},
	};
}

export default function SocialPage({ params }: { params: { id: string } }) {
	return <></>;
}
