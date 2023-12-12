// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { Redis } from "@upstash/redis/nodejs";
import type { Metadata } from "next";
import { getShortLinkPersistenceKey } from "~/lib/shortLink";
import { parse } from "~/lib/urlState/jsurl2";
import JsYaml from "js-yaml";
import type { IConfig } from "~/components/react-flow/dataType";

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
	const jsonData = parseUrl(url);
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

function parseUrl(url: URL) {
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
	const jsonData = JsYaml.load(parsedConfig) as IConfig;
	return jsonData;
}

function sortAndDeduplicate(arr: string[]) {
	const sortedStrings = arr.sort((a, b) => a.localeCompare(b));
	const modifiedStrings = sortedStrings.map((str) => str.split("/")[0]);
	const uniqueStrings = [...new Set(modifiedStrings)];
	const joinedStrings = uniqueStrings.join(", ");
	return joinedStrings;
}

function extractComponents(jsonData: IConfig) {
	const components: string[] = [];

	Object.keys(jsonData).forEach((key) => {
		if (key !== "service") {
			const value = jsonData[key];
			const component = Object.keys(value as string[]);
			components.push(...component);
		}
	});
	return components;
}
