// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { parentNodesConfig } from "./ParentsNode";

export default function ParentNodeTag({ tag }: { tag: string }) {
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
			{parentNodesConfig
				.filter((config) => tag.match(config.typeRegex))
				.map((node, idx) => {
					return (
						<div
							key={idx}
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								display: "flex",
								backgroundColor: node.tagBackgroundColor,
								borderRadius: "4px 0px 4px 0px",
								height: "20px",
								width: "60px",
							}}
							tw="items-center px-2 py-1 text-xs font-semibold text-black -ml-[1px] -mt-[1px]"
						>
							{node.icon}
							<p>{FormatTag(tag)}</p>
						</div>
					);
				})}
		</>
	);
}
