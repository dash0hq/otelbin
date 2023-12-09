// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { ImageResponse, type NextRequest } from "next/server";
import { calcNodes } from "~/components/react-flow/useClientNodes";
import { type Node } from "reactflow";
import ParentsNode from "../ParentsNode";
import { Redis } from "@upstash/redis/nodejs";
import { getShortLinkPersistenceKey } from "~/lib/shortLink";
import { parse } from "~/lib/urlState/jsurl2";
import JsYaml from "js-yaml";
import type { IConfig } from "~/components/react-flow/dataType";

export const runtime = "edge";

const redis = Redis.fromEnv();

export async function GET(request: NextRequest) {
	const shortLinkId = request.nextUrl.searchParams.get("id") ?? "";
	const fullLink = (await redis.get<string>(getShortLinkPersistenceKey(shortLinkId))) ?? "";
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

	const jsonData = JsYaml.load(parsedConfig) as IConfig;
	const edgeWidth = 80;
	const initNodes = calcNodes(jsonData, true);
	const parentNodes = initNodes?.filter((node) => node.type === "parentNodeType");
	const processors = initNodes?.filter((node) => node.type === "processorsNode");

	function calcScale(nodes?: Node[]) {
		const targetHeight = 630;
		const targetWidth = 1200;
		const nodesHeight = nodes?.map((node) => node.data.height) ?? [0];
		const totalHeight = nodesHeight?.reduce((sum, height) => sum + (height + 50), 0) + 4 * 24;
		const totalHorizontalNodesCount = (processors?.length ?? 0) + 2;
		const totalWidth = totalHorizontalNodesCount * 140 + (totalHorizontalNodesCount - 1) * edgeWidth;
		const scale = Math.min(targetHeight / totalHeight, targetWidth / totalWidth);
		return scale.toString();
	}

	return new ImageResponse(
		(
			<div
				style={{
					height: "100%",
					width: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					alignItems: "center",
					backgroundColor: "#151721",
					position: "relative",
					backgroundImage: `url(${new URL(`/dot.svg`, url.origin)})`,
					backgroundRepeat: "repeat",
					backgroundPosition: "center",
				}}
			>
				<div
					style={{
						transform: `scale(${calcScale(parentNodes)})`,
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
					}}
					tw="bg-transparent"
				>
					{parentNodes?.map((parentNode, idx) => <ParentsNode key={idx} nodeData={parentNode} nodes={initNodes} />)}
				</div>
			</div>
		),
		{
			width: 1200,
			height: 630,
		}
	);
}
