// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import React, { memo, useState } from "react";
import { Handle, Position } from "reactflow";
import { useEditorRef, useFocus } from "~/contexts/EditorContext";
import { FlowClick } from "./FlowClick";
import type { IData } from "./FlowClick";
import { Download } from "lucide-react";

const ReceiversNode = ({ data }: { data: IData }) => {
	const [hovered, setHovered] = useState(false);
	const editorRef = useEditorRef();
	const { isFocused } = useFocus();

	const customNodeHeaderStyle = {
		borderRadius: "8px 8px 0px 0px",
	};

	const customNodeStyles = {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
		height: "65%",
		background: hovered ? "#40454E" : "#30353D",
		transition: "background-color 0.3s ease-in-out",
		borderRadius: "0px 0px 8px 8px",
		paddingBottom: "6px",
		paddingTop: "6px",
		borderLeft: `1px solid ${hovered ? "6D737D" : "#40454E"}`,
		borderRight: `1px solid ${hovered ? "6D737D" : "#40454E"}`,
		borderBottom: `1px solid ${hovered ? "6D737D" : "#40454E"}`,
	};

	function handleClickNode(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
		FlowClick(event, data, editorRef);
	}
	const label = data.label || "";
	const splitLabel = label.split("/");
	const hasSlash = splitLabel.length > 1;
	return (
		<div className="flex h-20 w-[120px] flex-col items-center rounded-lg shadow-node">
			<div
				style={customNodeHeaderStyle}
				className="px-3 bg-violet-500 text-xs font-medium h-[35%] overflow-hidden whitespace-nowrap overflow-ellipsis w-full flex items-center justify-center"
			>
				{splitLabel[0]}
			</div>
			<div
				style={customNodeStyles}
				className={`cursor-pointer flex-col ${isFocused === data.id ? "animate-focus" : ""}`}
				onClick={handleClickNode}
				onMouseEnter={() => setHovered(true)}
				onMouseLeave={() => setHovered(false)}
			>
				<div
					className={`flex w-full flex-col items-center justify-center gap-y-1 px-2  ${
						splitLabel[1] && splitLabel[1].length > 0 && "mt-[2px]"
					}`}
				>
					<Download color={hovered ? "#F3F5F6" : "#9CA2AB"} width={20} />
					{hasSlash && (
						<div
							className={`${
								hovered ? "text-neutral-900" : "text-neutral-600"
							} text-[10px] font-normal  overflow-hidden whitespace-nowrap overflow-ellipsis max-w-[90%]`}
						>
							{splitLabel[1]}
						</div>
					)}
				</div>
				<Handle
					type="source"
					position={Position.Right}
					style={{
						backgroundColor: "rgb(44 48 70 / 0%)",
						borderColor: "rgb(44 48 70 / 0%)",
					}}
				/>
			</div>
		</div>
	);
};
export default memo(ReceiversNode);
