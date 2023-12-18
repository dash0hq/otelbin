// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { FormatTag } from "~/components/react-flow/node-types/ParentNodeTag";
import { parentNodesConfig } from "~/components/react-flow/node-types/ParentsNode";

export default function ParentNodeTag({ tag }: { tag: string }) {
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
								top: -8,
								left: -20,
								display: "flex",
								alignItems: "center",
								backgroundColor: node.tagBackgroundColor,
								borderRadius: "4px 0px 4px 0px",
								height: "20px",
								columnGap: "4px",
							}}
							tw="px-2 text-xs font-semibold text-black -ml-[1px] -mt-[1px] py-4"
						>
							{node.icon}
							{FormatTag(tag)}
						</div>
					);
				})}
		</>
	);
}
