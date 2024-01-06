// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import type { Edge, Node } from "reactflow";
import ParentNodeTag from "./ParentNodeTag";
import { ReceiversNode, ProcessorsNode, ExportersNode } from "./NodeTypes";
import { parentNodesConfig } from "~/components/react-flow/node-types/ParentsNode";
import { drawEdges } from "../s/[id]/metadataUtils";

const ParentsNode = ({ nodeData, edges, nodes }: { nodeData: Node; edges: Edge[]; nodes?: Node[] }) => {
	const maxWidth = nodeData.data.width;
	const receivers = nodes
		?.filter((node) => node.type === "receiversNode")
		.filter((receiver) => receiver.parentNode === nodeData.data.label);
	const exporters = nodes
		?.filter((node) => node.type === "exportersNode")
		.filter((exporter) => exporter.parentNode === nodeData.data.label);
	const processors = nodes
		?.filter((node) => node.type === "processorsNode")
		.filter((processor) => processor.parentNode === nodeData.data.label);

	const parentNodeEdges = edges.filter((edge) => {
		const sourceParent = edge.data.sourceParent;
		const targetParent = edge.data.targetParent;
		if (sourceParent === targetParent && sourceParent === nodeData.data.label) {
			return edge;
		}
	});

	const edgesToDraw = drawEdges(parentNodeEdges, nodeData);

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
								height: `${nodeData.data.height}px`,
								width: maxWidth,
							}}
							tw="rounded-[4px] text-[10px] text-black"
						>
							<ParentNodeTag tag={nodeData.data.label} />
							{receivers?.map((receiver) => <ReceiversNode key={receiver.id} data={receiver.data} />)}
							{processors?.map((processor) => <ProcessorsNode key={processor.id} data={processor.data} />)}
							{exporters?.map((exporter) => <ExportersNode key={exporter.id} data={exporter.data} />)}
							{Array.isArray(edgesToDraw) &&
								edgesToDraw.length > 0 &&
								edgesToDraw?.map((edge) => (
									<svg
										key={edge?.edge.id}
										style={{ position: "absolute" }}
										width={edge?.targetPosition.x}
										height={
											edge && edge?.targetPosition.y < edge?.sourcePosition.y
												? edge?.sourcePosition.y
												: edge?.targetPosition.y
										}
										xmlns="http://www.w3.org/2000/svg"
									>
										<defs>
											<marker
												id={`arrowhead-${edge?.edge.id}`}
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
										<path
											key={edge?.edge.id}
											d={`M${edge?.sourcePosition.x} ${edge?.sourcePosition.y} C ${
												edge && edge?.sourcePosition.x + 30
											} ${edge?.sourcePosition.y}, ${edge && edge?.targetPosition.x - 30} ${edge?.targetPosition
												.y} ${edge?.targetPosition.x} ${edge?.targetPosition.y}
										`}
											stroke="#FFFFFF"
											fill="transparent"
											markerEnd={`url(#arrowhead-${edge?.edge.id})`}
										/>
									</svg>
								))}
						</div>
					);
				})}
		</>
	);
};
export default ParentsNode;
