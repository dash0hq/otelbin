// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

// import ParentNodeTag from "./ParentNodeTag";
import { calcNodes } from "../../components/react-flow/useClientNodes";
import React from "react";
import ParentNodeTag from "./ParentNodeTag";
import { BarChart4, ListTree, Workflow } from "lucide-react";

interface IData {
	label: string;
	height: number;
	position: { x: number; y: number };
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

const ParentsNode = ({ data, jsonData, children }: { data: IData; jsonData: any; children: React.ReactNode }) => {
	const nodes = calcNodes(jsonData);
	const childNodes = nodes?.filter((node) => node.parentNode === data.label);
	const processorsNodesCount = childNodes?.filter((node) => node.type === "processorsNode").length ?? 0;
	const nodesWidth = 120;
	const sumOfExporterAndReceiver = 240;
	const edgesWidth = 80;
	const totalNodesWidth = (processorsNodesCount ?? 0) * nodesWidth + sumOfExporterAndReceiver;
	const totalEdgeWidth = edgesWidth * (processorsNodesCount + 1);
	const maxWidth = totalNodesWidth + (processorsNodesCount + 2) * 20 + totalEdgeWidth;

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
								display: "flex",
								justifyContent: "space-between",
								position: "relative",
								backgroundColor: node.backgroundColor,
								border: node.borderColor,
								height: data.height,
								width: maxWidth,
							}}
							tw="rounded-[4px] text-[10px] text-black my-3"
						>
							<ParentNodeTag tag={data.label} />

							<div style={{ display: "flex", justifyContent: "center" }}>{children}</div>
						</div>
					);
				})}
		</>
	);
};
export default ParentsNode;
