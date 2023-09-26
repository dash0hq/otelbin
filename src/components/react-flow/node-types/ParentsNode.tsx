// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import React, { memo } from "react";
import PipelineTag from "../PipelineTag";
import { useNodes, useReactFlow } from "reactflow";

interface IData {
	label: string;
	height: number;
}
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

	const parentColors = [
		{
			backgroundColor: "rgba(251, 191, 36, 0.05)",
			borderColor: "1px dashed #F59E0B",
		},
		{
			backgroundColor: "rgba(56, 189, 248, 0.05)",
			borderColor: "1px dashed #0AA8FF",
		},
		{
			backgroundColor: "rgba(52, 211, 153, 0.05)",
			borderColor: "1px dashed #40ad54",
		},
		{
			backgroundColor: "rgba(145, 29, 201, 0.05)",
			borderColor: "1px dashed #911dc9",
		},
	];

	return (
		<>
			{parentColors
				.filter((_, idx) => idx === findIndex)
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
							<PipelineTag findIndex={findIndex} tag={data.label} />
						</div>
					);
				})}
		</>
	);
};
export default memo(ParentsNode);
