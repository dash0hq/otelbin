// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { FormatTag } from "~/components/react-flow/node-types/ParentNodeTag";
import { parentNodesConfig } from "~/components/react-flow/node-types/ParentsNode";

export default function ParentNodeTag({ tag }: { tag: string }) {
	return (
		<>
			{parentNodesConfig
				.filter((config) => config.typeRegex.exec(tag))
				.map((node) => {
					return (
						<div
							key={node.type}
							style={{
								position: "absolute",
								top: 0,
								left: 0,
								display: "flex",
								alignItems: "center",
								backgroundColor: node.tagBackgroundColor,
								borderRadius: "4px 0px 4px 0px",
								height: "20px",
								columnGap: "4px",
							}}
							tw="px-2 text-xs font-semibold text-black -ml-[1px] -mt-[1px] py-4"
						>
							{node.serverSideIcon}
							{FormatTag(tag)}
						</div>
					);
				})}
		</>
	);
}
