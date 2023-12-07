// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { type Node } from "reactflow";
import ParentNodeTag from "./ParentNodeTag";
import { BarChart4, ListTree, Workflow } from "lucide-react";
import ArrowRight from "./svg/move-right.svg";
import { ReceiversNode, ProcessorsNode, ExportersNode } from "./NodeTypes";

export const parentNodesConfig = [
	{
		type: "traces",
		typeRegex: /^traces(\/.*)?$/i,
		backgroundColor: "rgba(251, 191, 36, 0.05)",
		tagBackgroundColor: "#FBBF24",
		borderColor: "1px dashed #F59E0B",
		icon: <Workflow width={12} />,
	},
	{
		type: "metrics",
		typeRegex: /^metrics(\/.*)?$/i,
		backgroundColor: "rgba(56, 189, 248, 0.05)",
		tagBackgroundColor: "#38BDF8",
		borderColor: "1px dashed #0AA8FF",
		icon: <BarChart4 width={12} />,
	},
	{
		type: "logs",
		typeRegex: /^logs(\/.*)?$/i,
		backgroundColor: "rgba(52, 211, 153, 0.05)",
		tagBackgroundColor: "#34D399",
		borderColor: "1px dashed #40ad54",
		icon: <ListTree width={12} />,
	},
	{
		type: "spans",
		typeRegex: /^spans(\/.*)?$/i,
		backgroundColor: "rgba(145, 29, 201, 0.05)",
		tagBackgroundColor: "#911dc9",
		borderColor: "1px dashed #911dc9",
		icon: <Workflow width={12} />,
	},
];

const ParentsNode = ({ nodeData, nodes }: { nodeData: Node; nodes?: Node[] }) => {
	const childNodes = nodes?.filter((node) => node.parentNode === nodeData.data.label);
	const processorsNodesCount = childNodes?.filter((node) => node.type === "processorsNode").length ?? 0;
	const nodesWidth = 110;
	const sumOfExporterAndReceiver = 240;
	const edgesWidth = 80;
	const totalNodesWidth = (processorsNodesCount ?? 0) * nodesWidth + sumOfExporterAndReceiver;
	const totalEdgeWidth = edgesWidth * (processorsNodesCount + 1);
	const totalPaddingX = 40;
	const maxWidth = totalNodesWidth + (processorsNodesCount + 2) * 20 + totalEdgeWidth + totalPaddingX;

	const receivers = nodes
		?.filter((node) => node.type === "receiversNode")
		.filter((receiver) => receiver.parentNode === nodeData.data.label);
	const exporters = nodes
		?.filter((node) => node.type === "exportersNode")
		.filter((exporter) => exporter.parentNode === nodeData.data.label);
	const processors = nodes
		?.filter((node) => node.type === "processorsNode")
		.filter((processor) => processor.parentNode === nodeData.data.label);

	const nodeHeight = 72;
	const nodeTotalMargin = 40;

	function calcSVGHeight(nodes?: Node[]) {
		const nodesCount = nodes?.length ?? 0;
		return nodesCount * (nodeHeight + nodeTotalMargin) - nodeTotalMargin;
	}

	function calcSVGPath(side: string, nodes?: Node[]) {
		const nodesCount = nodes?.length ?? 0;
		const height = nodesCount * (nodeHeight + nodeTotalMargin) - 72;

		return (
			<svg style={{ marginBottom: "30px" }} width="80" height={calcSVGHeight(nodes)} xmlns="http://www.w3.org/2000/svg">
				{Array.isArray(nodes) &&
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
					))}
			</svg>
		);
	}

	return (
		<>
			{parentNodesConfig
				.filter((config) => nodeData.data.label.match(config.typeRegex))
				.map((node, idx) => {
					return (
						<div
							id={"parentNode"}
							key={idx}
							style={{
								display: "flex",
								justifyContent: "space-between",
								position: "relative",
								backgroundColor: node.backgroundColor,
								border: node.borderColor,
								height: nodeData.data.height,
								width: maxWidth,
							}}
							tw="rounded-[4px] text-[10px] text-black my-3 px-5 py-2"
						>
							<ParentNodeTag tag={nodeData.data.label} />

							<div style={{ display: "flex", justifyContent: "center" }}>
								<div tw="flex items-center">
									<div tw="flex flex-col justify-center">
										{receivers?.map((receiver, idx) => <ReceiversNode key={idx} data={receiver.data} />)}
									</div>
									{processors?.length === 0 ? (
										<></>
									) : receivers?.length === 1 ? (
										<ArrowRight />
									) : (
										calcSVGPath("left", receivers)
									)}
								</div>
								<div tw="flex items-center">
									<div tw="flex justify-center items-center">
										{processors?.map((processor, idx) => (
											<div key={idx} tw="flex justify-center items-center">
												{idx > 0 ? <ArrowRight /> : <></>}
												<ProcessorsNode key={idx} data={processor.data} />
											</div>
										))}
									</div>
									{exporters?.length === 1 ? <ArrowRight /> : calcSVGPath("right", exporters)}
									<div tw="flex flex-col justify-center">
										{exporters?.map((exporter, idx) => <ExportersNode key={idx} data={exporter.data} />)}
									</div>
								</div>
							</div>
						</div>
					);
				})}
		</>
	);
};
export default ParentsNode;
