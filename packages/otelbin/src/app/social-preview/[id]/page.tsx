// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { Redis } from "@upstash/redis/nodejs";
import type { Metadata } from "next";
import type { IConfig } from "~/components/react-flow/dataType";
import { extractComponents, parseUrlFragment, sortAndDeduplicate } from "~/lib/metadataUtils";
import { getShortLinkPersistenceKey } from "~/lib/shortLink";

interface ExtendedMetadata {
	twitterData1: string;
	twitterLabel1: string;
	twitterData2: string;
	twitterLabel2: string;
}

const redis = Redis.fromEnv();
const width = 1200;
const height = 630;
const ogImageAlt = "OpenTelemetry collector configuration pipeline visualization by OTelBin";

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
	const extendedMetadata: ExtendedMetadata = {
		twitterLabel1: "Components",
		twitterData1: "",
		twitterLabel2: "Pipelines",
		twitterData2: "",
	};
	const fullLink = (await redis.get<string>(getShortLinkPersistenceKey(params.id))) ?? "";
	const url = new URL(fullLink);
	const imagesUrl = new URL(`/og/${params.id}`, url.origin);
	const jsonData = parseUrlFragment(url) as IConfig;
	const components = extractComponents(jsonData);
	const pipelines = Object.keys(jsonData?.service?.pipelines ?? {});
	extendedMetadata.twitterData1 = sortAndDeduplicate(components);
	extendedMetadata.twitterData2 = sortAndDeduplicate(pipelines);

	return {
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
		other: {
			"twitter:label1": extendedMetadata.twitterLabel1,
			"twitter:data1": extendedMetadata.twitterData1,
			"twitter:label2": extendedMetadata.twitterLabel2,
			"twitter:data2": extendedMetadata.twitterData2,
		},
	};
}

export default function SocialPage() {
	return <div className="flex justify-center items-center h-screen">Empty Page</div>;
}
