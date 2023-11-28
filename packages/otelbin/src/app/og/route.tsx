// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { ImageResponse } from "next/server";
import { calcNodes } from "~/components/react-flow/useClientNodes";
import { type Node } from "reactflow";
import ParentsNode from "./ParentsNode";

export const runtime = "edge";

const jsonData = {
	connectors: {
		otlp: {
			protocols: {
				grpc: {
					endpoint: "otelcol:4317",
				},
			},
		},
		zipkin: {
			protocols: {
				http: {
					endpoint: "otelcol:9411",
				},
			},
		},
	},
	receivers: {
		otlp: {
			protocols: {
				grpc: {
					endpoint: "otelcol:4317",
				},
			},
		},
		zipkin: {
			protocols: {
				http: {
					endpoint: "otelcol:9411",
				},
			},
		},
	},
	processors: {
		batch: {
			timeout: "1s",
			send_batch_size: 8192,
			receive_batch_size: 8192,
		},
		memory_limiter: {
			limit_mib: 512,
		},
		queued_retry: {
			num_workers: 10,
			backoff_delay: "5s",
			max_attempts: 100,
			initial_backoff_delay: "500ms",
			max_backoff_delay: "5s",
		},
		resource: {
			attributes: {
				"service.name": "otelbin",
			},
		},
	},
	exporters: {
		otlp: {
			endpoint: "http://otelbin:4317",
		},
		zipkin: {
			endpoint: "http://otelbin:9411/api/v2/spans",
		},
	},
	service: {
		pipelines: {
			traces: {
				receivers: ["otlp"],
				processors: ["batch"],
				exporters: ["otlp"],
			},
			metrics: {
				receivers: ["otlp2"],
				processors: ["batch"],
				exporters: ["otlp"],
			},
			logs: {
				receivers: ["otlp3"],
				processors: ["batch"],
				exporters: ["otlp"],
			},
		},
	},
};

export function GET() {
	const edgeWidth = 80;
	const initNodes = calcNodes(jsonData, true);
	const parentNodes = initNodes?.filter((node) => node.type === "parentNodeType");
	const processors = initNodes?.filter((node) => node.type === "processorsNode");

	function calcScale(nodes?: Node[]) {
		const targetHeight = 630;
		const targetWidth = 1200;
		const nodesHeight = nodes?.map((node) => node.data.height);
		const totalHeight = nodesHeight?.reduce((sum, height) => sum + (height ?? 0), 0) + 4 * 24 ?? 0;
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
				}}
			>
				<div
					style={{
						transform: `scale(${calcScale(parentNodes)})`,
						display: "flex",
						flexDirection: "column",
						justifyContent: "center",
					}}
					tw="bg-[#151721]"
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
