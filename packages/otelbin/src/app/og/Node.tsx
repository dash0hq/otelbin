// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import React from "react";
import ConnectorIcon from "../../components/assets/svg/connector.svg";

export interface IData {
	label: string;
	parentNode: string;
	type: string;
	id: string;
}

const Node = ({ data, icon, type }: { data: IData; icon: React.ReactNode; type: string }) => {
	const customNodeHeaderStyle = {
		borderRadius: "8px 8px 0px 0px",
	};

	const iconColor = {
		color: "#9CA2AB",
		display: "flex",
	};

	const customNodeStyles = {
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		width: "100%",
		height: "65%",
		background: "#30353D",
		borderRadius: "0px 0px 8px 8px",
		paddingBottom: "6px",
		paddingTop: "6px",
		borderLeft: `1px solid  #40454E`,
		borderRight: `1px solid  #40454E`,
		borderBottom: `1px solid  #40454E`,
	};

	const label = data.label || "";
	const splitLabel = label.includes("/") ? label.split("/") : [label];
	const isConnector = data.type.includes("connectors");

	return (
		<div tw={`h-[72px] w-[110px] flex-col items-center rounded-lg my-5 mx-[10px] flex`}>
			<div
				style={customNodeHeaderStyle}
				tw={`px-3  text-xs font-medium h-[35%] w-full flex items-center justify-center text-white
				   ${
							isConnector && (type === "exporter" || type === "receiver")
								? "bg-green-500 text-black"
								: type === "processor"
									? "bg-blue-500"
									: "bg-violet-500"
						}
                `}
			>
				{splitLabel[0]}
			</div>
			<div style={customNodeStyles} tw="flex-col">
				<div
					tw={`flex w-full flex-col items-center justify-center px-2 ${
						splitLabel[1] && splitLabel[1].length > 0 ? "mt-[2px]" : ""
					}`}
				>
					<div style={iconColor}>{isConnector ? <ConnectorIcon /> : icon}</div>
					{splitLabel.length > 1 && (
						<div tw={"text-neutral-600 text-[10px] font-normal  overflow-hidden max-w-[90%]"}>{splitLabel[1]}</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default Node;
