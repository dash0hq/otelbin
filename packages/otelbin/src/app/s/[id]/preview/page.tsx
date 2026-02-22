// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { Redis } from "@upstash/redis";
import type { Metadata } from "next";
import type { IConfig } from "~/components/react-flow/dataType";
import { getShortLinkPersistenceKey } from "~/lib/shortLink";
import { editorBinding } from "~/components/monaco-editor/editorBinding";
import JsYaml, { FAILSAFE_SCHEMA } from "js-yaml";
import { extractComponents, sortAndDeduplicate, toUrlState } from "~/app/s/[id]/metadataUtils";
import { notFound } from "next/navigation";

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

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
	const { id } = await params;
	if (!id) {
		return notFound();
	}
	const extendedMetadata: ExtendedMetadata = {
		twitterLabel1: "Components",
		twitterData1: "",
		twitterLabel2: "Pipelines",
		twitterData2: "",
	};
	try {
		const fullLink = (await redis.get<string>(getShortLinkPersistenceKey(id))) ?? "";
		if (!fullLink) {
			return notFound();
		}
		const url = new URL(fullLink);
		const imagesUrl = new URL(`/s/${id}/img`, url.origin);
		const { config } = toUrlState(url, [editorBinding]);
		const jsonData = JsYaml.load(config, { schema: FAILSAFE_SCHEMA }) as IConfig;
		const components = extractComponents(jsonData);
		const pipelines = Object.keys(jsonData?.service?.pipelines ?? {});
		extendedMetadata.twitterData1 = sortAndDeduplicate(components);
		extendedMetadata.twitterData2 = sortAndDeduplicate(pipelines);

		return {
			metadataBase: new URL(url.origin),
			openGraph: {
				images: [
					{
						url: imagesUrl.href,
						width: width,
						height: height,
						alt: ogImageAlt,
						type: "image/png",
					},
				],
			},
			twitter: {
				title: "OTelBin – by Dash0",
				site: "@dash0hq",
				card: "summary_large_image",
				description: "Edit, visualize and share OpenTelemetry Collector configurations",
				images: [
					{
						url: imagesUrl.href,
						width: width,
						height: height,
						alt: ogImageAlt,
						type: "image/png",
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
	} catch (error) {
		console.error(`Error generating metadata: ${error}`);
		notFound();
	}
}

export default function SocialPage() {
	return <div className="flex justify-center items-center h-screen">Empty Page</div>;
}
