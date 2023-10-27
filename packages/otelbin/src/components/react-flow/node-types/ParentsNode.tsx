// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import React, { memo } from "react";
import ParentNodeTag from "./ParentNodeTag";
import { useNodes, useReactFlow } from "reactflow";
import { BarChart4, ListTree, Workflow } from "lucide-react";

interface IData {
	label: string;
	height: number;
}

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

const ParentsNode = ({ data }: { data: IData }) => {
	const rectaFlowInstance = useReactFlow();
	const nodes = useNodes();
	const childNodes = nodes.filter((node) => node.parentNode === data.label);
	const childProcessorsNodes = childNodes.filter((node) => node.type === "processorsNode");
	const maxWidth = childProcessorsNodes.length * 200 + 430;

	const parentNodes = rectaFlowInstance
		.getNodes()
		.filter((node) => node.type === "parentNodeType")
		.map((node) => node.data.label);
	const findIndex = parentNodes.findIndex((node) => node === data.label);

	return (
		<>
			{parentNodesConfig
				.filter((config) => data.label.match(config.typeRegex))
				.map((node, idx) => {
					return (
						<div
							id={"parentNode"}
							key={idx}
							style={{
								backgroundColor: node.backgroundColor,
								border: node.borderColor,
								height: data.height,
								width: maxWidth,
							}}
							className="rounded-[4px] text-[10px] text-black"
						>
							<ParentNodeTag findIndex={findIndex} tag={data.label} />
						</div>
					);
				})}
		</>
	);
};
export default memo(ParentsNode);
