// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { ImageResponse, NextResponse, type NextRequest } from "next/server";
import { calcNodes } from "~/components/react-flow/useClientNodes";
import ParentsNode from "../../../og/ParentsNode";
import { Redis } from "@upstash/redis/nodejs";
import { getShortLinkPersistenceKey } from "~/lib/shortLink";
import type { IConfig } from "~/components/react-flow/dataType";
import { editorBinding } from "~/components/monaco-editor/editorBinding";
import JsYaml, { FAILSAFE_SCHEMA } from "js-yaml";
import { calcScale, toUrlState } from "../metadataUtils";
import Logo from "~/components/assets/svg/otelbin_logo_white.svg";
import { notFound } from "next/navigation";
import { calcEdges } from "~/components/react-flow/useEdgeCreator";
import { getLayoutedElements } from "~/components/react-flow/layout/useLayout";

export const runtime = "edge";

const redis = Redis.fromEnv();

export async function GET(request: NextRequest) {
	const shortLinkId = request.nextUrl.searchParams.get("id") ?? "";
	if (!shortLinkId) {
		return notFound();
	}
	const fullLink = (await redis.get<string>(getShortLinkPersistenceKey(shortLinkId))) ?? "";
	let url;
	try {
		url = new URL(fullLink);
	} catch (e) {
		return new NextResponse("Invalid short link ID", { status: 400 });
	}
	const { config } = toUrlState(url, [editorBinding]);
	const jsonData = JsYaml.load(config, { schema: FAILSAFE_SCHEMA }) as IConfig;
	const initNodes = calcNodes(jsonData);

	const initEdges = calcEdges(initNodes ?? []);
	const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(initNodes ?? [], initEdges);
	const parentNodes = layoutedNodes?.filter((node) => node.type === "parentNodeType");

	const scale = calcScale(parentNodes)?.scale;
	const totalYOffset = calcScale(parentNodes)?.totalYOffset ?? 0;
	const totalXOffset = calcScale(parentNodes)?.totalXOffset ?? 0;

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
					backgroundImage: `url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIiBmaWxsPSIjODI4MjhCIiBzdHJva2U9IiM4MjgyOEIiIHN0cm9rZS13aWR0aD0iMSIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1kb3QiPjxjaXJjbGUgY3g9IjEyLjEiIGN5PSIxMi4xIiByPSIwLjUiLz48L3N2Zz4=)`,
					backgroundSize: `${Number(scale) * 20}px ${Number(scale) * 20}px`,
					backgroundRepeat: "repeat",
					backgroundPosition: "center",
				}}
			>
				<div style={{ display: "flex", position: "absolute", bottom: 20, right: 20 }}>
					<Logo height={40} />
				</div>
				<div
					style={{
						transformOrigin: "center left",
						transform: `scale(${scale})`,
						display: "flex",
						position: "relative",
						width: "100%",
					}}
					tw="bg-transparent"
				>
					{parentNodes?.map((parentNode) => (
						<div
							key={parentNode.id}
							style={{
								display: "flex",
								position: "absolute",
								top: parentNode.position.y + totalYOffset,
								left: parentNode.position.x + totalXOffset,
							}}
						>
							<ParentsNode key={parentNode.id} nodeData={parentNode} nodes={layoutedNodes} edges={layoutedEdges} />
						</div>
					))}
				</div>
			</div>
		),
		{
			width: 1200,
			height: 630,
			headers: { "Cache-Control": "public, max-age=3600, stale-while-revalidate=604800, stale-if-error=604800" },
		}
	);
}
