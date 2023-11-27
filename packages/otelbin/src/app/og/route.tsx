// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { ImageResponse } from "next/server";
import { calcNodes } from "~/components/react-flow/useClientNodes";
import { type Node } from "reactflow";
import ParentsNode from "./ParentsNode";
import ArrowRight from "./svg/move-right.svg";
import { ReceiversNode, ProcessorsNode, ExportersNode } from "./NodeTypes";
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
				receivers: ["otlp", "zipkin"],
				processors: ["batch"],
				exporters: ["otlp", "zipkin", "otlp2", "otlp8", "otlp9", "otlp10"],
			},
			metrics: {
				receivers: ["otlp2", "otlp3", "otlp4", "otlp5"],
				processors: ["batch", "memory_limiter", "queued_retry", "metricstransform"],
				exporters: ["otlp"],
			},
			logs: {
				receivers: ["otlp3", "otlp4", "otlp5", "otlp6", "otlp7", "otlp8", "otlp9", "otlp10"],
				processors: ["batch", "memory_limiter", "queued_retry", "resource", "tail_sampling", "metricstransform"],
				exporters: ["otlp", "zipkin"],
			},
		},
	},
};
export function GET() {
	const edgeWidth = 80;
	const nodeHeight = 80;
	const nodeTotalMargin = 40;
	const initNodes = calcNodes(jsonData, true);
	const parentNodes = initNodes?.filter((node) => node.type === "parentNodeType");
	const receivers = initNodes?.filter((node) => node.type === "receiversNode");
	const processors = initNodes?.filter((node) => node.type === "processorsNode");
	const exporters = initNodes?.filter((node) => node.type === "exportersNode");

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

	function calcSVGHeight(nodes?: Node[]) {
		const nodesCount = nodes?.length ?? 0;
		return nodesCount * (nodeHeight + nodeTotalMargin) - nodeTotalMargin;
	}

	function calcSVGPath(side: string, nodes?: Node[]) {
		const nodesCount = nodes?.length ?? 0;
		const height = nodesCount * (nodeHeight + nodeTotalMargin) - 80;
		return (
			Array.isArray(nodes) &&
			nodes?.length > 0 &&
			nodes.map((_, idx) => (
				<path
					key={idx}
					d={
						side === "left"
							? `M10 ${(idx + 1) * (height / nodesCount) - 60} 
				    C 20,${(idx + 1) * (height / nodesCount) - 60},35,${height / 2 - 20}  
						 50 ${height / 2 - 20}`
							: `M10 ${height / 2 - 20}
						C 20,${height / 2 - 20},35,${(idx + 1) * (height / nodesCount) - 60}  
							 50 ${(idx + 1) * (height / nodesCount) - 60}`
					}
					stroke="#FFFFFF"
					fill="transparent"
				/>
			))
		);
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
					{parentNodes?.map((node, idx) => (
						<ParentsNode key={idx} data={node.data} jsonData={jsonData}>
							<div tw="flex items-center">
								<div tw="flex flex-col justify-center">
									{receivers
										?.filter((receiver) => receiver.parentNode === node.data.label)
										.map((receiver, idx) => <ReceiversNode key={idx} data={receiver.data} />)}
								</div>
								{receivers?.filter((receiver) => receiver.parentNode === node.data.label).length === 1 ? (
									<ArrowRight />
								) : (
									<svg
										style={{ marginBottom: "30px" }}
										width="80"
										height={calcSVGHeight(receivers?.filter((receiver) => receiver.parentNode === node.data.label))}
										xmlns="http://www.w3.org/2000/svg"
									>
										{calcSVGPath("left", receivers?.filter((receiver) => receiver.parentNode === node.data.label))}
									</svg>
								)}
							</div>
							<div tw="flex items-center">
								<div tw="flex justify-center items-center">
									{processors
										?.filter((processor) => processor.parentNode === node.data.label)
										.map((processor, idx) => (
											<div key={idx} tw="flex justify-center items-center">
												{idx > 0 ? <ArrowRight /> : <></>}
												<ProcessorsNode key={idx} data={processor.data} />
											</div>
										))}
								</div>
								{exporters?.filter((exporter) => exporter.parentNode === node.data.label).length === 1 ? (
									<ArrowRight />
								) : (
									<svg
										style={{ marginBottom: "30px" }}
										width="80"
										height={calcSVGHeight(exporters?.filter((exporter) => exporter.parentNode === node.data.label))}
										xmlns="http://www.w3.org/2000/svg"
									>
										{calcSVGPath("right", exporters?.filter((exporter) => exporter.parentNode === node.data.label))}
									</svg>
								)}
								<div tw="flex flex-col justify-center">
									{exporters
										?.filter((exporter) => exporter.parentNode === node.data.label)
										.map((exporter, idx) => <ExportersNode key={idx} data={exporter.data} />)}
								</div>
							</div>
						</ParentsNode>
					))}
				</div>
			</div>
		),
		{
			width: 1200,
			height: 630,
		}
	);
}
