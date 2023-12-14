// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { ImageResponse, type NextRequest } from "next/server";
import { calcNodes } from "~/components/react-flow/useClientNodes";
import ParentsNode from "../ParentsNode";
import { Redis } from "@upstash/redis/nodejs";
import { getShortLinkPersistenceKey } from "~/lib/shortLink";
import { calcScale, parseUrlFragment } from "~/lib/metadataUtils";
import { IConfig } from "~/components/react-flow/dataType";

export const runtime = "edge";

const redis = Redis.fromEnv();
const edgeWidth = 80;

export async function GET(request: NextRequest) {
	const shortLinkId = request.nextUrl.searchParams.get("id") ?? "";
	const fullLink = (await redis.get<string>(getShortLinkPersistenceKey(shortLinkId))) ?? "";
	const url = new URL(fullLink);
	const jsonData = parseUrlFragment(url) as IConfig;
	const initNodes = calcNodes(jsonData, true);
	const parentNodes = initNodes?.filter((node) => node.type === "parentNodeType");

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
					backgroundSize: `${Number(calcScale(edgeWidth, initNodes)) * 20}px ${
						Number(calcScale(edgeWidth, initNodes)) * 20
					}px`,
					backgroundRepeat: "repeat",
					backgroundPosition: "center",
				}}
			>
				<div
					style={{
						transform: `scale(${calcScale(edgeWidth, initNodes)})`,
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
			headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=3600, stale-if-error=3600" },
		}
	);
}
