// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { BarChart4, ListTree, Workflow } from "lucide-react";

const parentNodeStyle = [
	{
		backgroundColor: "#FBBF24",
		icon: <Workflow width={12} />,
	},
	{
		backgroundColor: "#38BDF8",
		icon: <BarChart4 width={12} />,
	},
	{
		backgroundColor: "#34D399",
		icon: <ListTree width={12} />,
	},
	{
		backgroundColor: "#911dc9",
		icon: <Workflow width={12} />,
	},
];

export default function PipelineTag({ findIndex, tag }: { findIndex: number; tag: string }) {
	return (
		<>
			{parentNodeStyle
				.filter((_, idx) => idx === findIndex)
				.map((node) => {
					return (
						<div
							style={{ backgroundColor: node.backgroundColor, borderRadius: "4px 0px 4px 0px" }}
							className="flex w-fit items-center gap-x-1 px-2 py-1 text-xs font-semibold text-black"
						>
							{node.icon}
							<p>{tag.charAt(0).toUpperCase() + tag.slice(1)}</p>
						</div>
					);
				})}
		</>
	);
}
