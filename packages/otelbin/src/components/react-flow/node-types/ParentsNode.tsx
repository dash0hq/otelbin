// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { memo } from "react";
import ParentNodeTag from "./ParentNodeTag";
import { BarChart4, ListTree, Workflow } from "lucide-react";
import BarChart4Svg from "../../../components/assets/svg/bar-chart-4.svg";
import ListTreeSvg from "../../../components/assets/svg/list-tree.svg";
import WorkflowSvg from "../../../components/assets/svg/workflow.svg";

interface IData {
	label: string;
	height: number;
	position: { x: number; y: number };
	width: number;
}

export const parentNodesConfig = [
	{
		type: "traces",
		typeRegex: /^traces(\/.*)?$/i,
		backgroundColor: "rgba(251, 191, 36, 0.05)",
		tagBackgroundColor: "#FBBF24",
		borderColor: "1px dashed #F59E0B",
		icon: <Workflow width={12} />,
		serverSideIcon: <WorkflowSvg style={{ height: 12, width: 12 }} />,
	},
	{
		type: "metrics",
		typeRegex: /^metrics(\/.*)?$/i,
		backgroundColor: "rgba(56, 189, 248, 0.05)",
		tagBackgroundColor: "#38BDF8",
		borderColor: "1px dashed #0AA8FF",
		icon: <BarChart4 width={12} />,
		serverSideIcon: <BarChart4Svg style={{ height: 12, width: 12 }} />,
	},
	{
		type: "logs",
		typeRegex: /^logs(\/.*)?$/i,
		backgroundColor: "rgba(52, 211, 153, 0.05)",
		tagBackgroundColor: "#34D399",
		borderColor: "1px dashed #40ad54",
		icon: <ListTree width={12} />,
		serverSideIcon: <ListTreeSvg style={{ height: 12, width: 12 }} />,
	},
	{
		type: "spans",
		typeRegex: /^spans(\/.*)?$/i,
		backgroundColor: "rgba(145, 29, 201, 0.05)",
		tagBackgroundColor: "#911dc9",
		borderColor: "1px dashed #911dc9",
		icon: <Workflow width={12} />,
		serverSideIcon: <WorkflowSvg style={{ height: 12, width: 12 }} />,
	},
];

const ParentsNode = ({ data }: { data: IData }) => {
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
								width: data.width,
							}}
							className="rounded-[4px] text-[10px] text-black"
						>
							<ParentNodeTag tag={data.label} />
						</div>
					);
				})}
		</>
	);
};
export default memo(ParentsNode);
