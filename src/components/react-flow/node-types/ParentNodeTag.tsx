// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { BarChart4, ListTree, Workflow } from "lucide-react";

const parentNodeStyle = [
	{
		parentNode: "traces",
		backgroundColor: "#FBBF24",
		icon: <Workflow width={12} />,
	},
	{
		parentNode: "metrics",
		backgroundColor: "#38BDF8",
		icon: <BarChart4 width={12} />,
	},
	{
		parentNode: "logs",
		backgroundColor: "#34D399",
		icon: <ListTree width={12} />,
	},
	{
		parentNode: "spans",
		backgroundColor: "#911dc9",
		icon: <Workflow width={12} />,
	},
];

export default function ParentNodeTag({ tag }: { findIndex: number; tag: string }) {
	function FormatTag(tagName: string) {
		const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
		let resultString = [""];
		if (tagName.includes("/")) {
			resultString = tagName.split("/");
			return capitalize(resultString.join(" / "));
		} else {
			return capitalize(tagName);
		}
	}

	return (
		<>
			{parentNodeStyle
				.filter((style) => tag.includes(style.parentNode))
				.map((node, idx) => {
					return (
						<div
							key={idx}
							style={{ backgroundColor: node.backgroundColor, borderRadius: "4px 0px 4px 0px" }}
							className="flex w-fit items-center gap-x-1 px-2 py-1 text-xs font-semibold text-black -ml-[1px] -mt-[1px]"
						>
							{node.icon}
							<p>{FormatTag(tag)}</p>
						</div>
					);
				})}
		</>
	);
}
