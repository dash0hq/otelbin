// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import { type Node } from "reactflow";
import ParentNodeTag from "./ParentNodeTag";
import ArrowRight from "../../components/assets/svg/move-right.svg";
import { ReceiversNode, ProcessorsNode, ExportersNode } from "./NodeTypes";
import { parentNodesConfig } from "~/components/react-flow/node-types/ParentsNode";

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
		const height = nodesCount * (nodeHeight + nodeTotalMargin) - 40;

		return (
			<svg style={{ marginBottom: "30px" }} width="80" height={calcSVGHeight(nodes)} xmlns="http://www.w3.org/2000/svg">
				<defs>
					<marker
						id="arrowhead"
						viewBox="0 -5 10 10"
						refX="5"
						refY="0"
						markerWidth="10"
						markerHeight="10"
						orient="auto"
						fill="transparent"
						stroke="#FFFFFF"
					>
						<g>
							<path d="M0,-4L7,0L0,4" strokeWidth={0.5}></path>
							<path d="M-1,-3.5L6,0L-1,3.5" strokeWidth={0.5}></path>
						</g>
					</marker>
				</defs>
				{Array.isArray(nodes) &&
					nodes?.length > 0 &&
					nodes.map((node, idx) => (
						<path
							key={node.id}
							d={
								side === "left"
									? `M10 ${(idx + 1) * (height / nodesCount) - 75} 
				    C 20,${(idx + 1) * (height / nodesCount) - 75},35,${height / 2 - 25}  
						 50 ${height / 2 - 25}`
									: `M10 ${height / 2 - 25}
						C 20,${height / 2 - 25},35,${(idx + 1) * (height / nodesCount) - 75}  
							 50 ${(idx + 1) * (height / nodesCount) - 75}`
							}
							stroke="#FFFFFF"
							fill="transparent"
							markerEnd="url(#arrowhead)"
						/>
					))}
			</svg>
		);
	}

	return (
		<>
			{parentNodesConfig
				.filter((config) => nodeData.data.label.match(config.typeRegex))
				.map((node) => {
					return (
						<div
							id={"parentNode"}
							key={node.type}
							style={{
								display: "flex",
								justifyContent: "space-between",
								position: "relative",
								backgroundColor: node.backgroundColor,
								border: node.borderColor,
								height: `${nodeData.data.height + 50}px`,
								width: maxWidth,
							}}
							tw="rounded-[4px] text-[10px] text-black my-3 px-5 py-2"
						>
							<ParentNodeTag tag={nodeData.data.label} />

							<div style={{ display: "flex", justifyContent: "center" }}>
								<div tw="flex items-center">
									<div tw="flex flex-col justify-center">
										{receivers?.map((receiver) => <ReceiversNode key={receiver.id} data={receiver.data} />)}
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
											<div key={processor.id} tw="flex justify-center items-center">
												{idx > 0 ? <ArrowRight /> : <></>}
												<ProcessorsNode data={processor.data} />
											</div>
										))}
									</div>
									{exporters?.length === 1 ? <ArrowRight /> : calcSVGPath("right", exporters)}
									<div tw="flex flex-col justify-center">
										{exporters?.map((exporter) => <ExportersNode key={exporter.id} data={exporter.data} />)}
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
