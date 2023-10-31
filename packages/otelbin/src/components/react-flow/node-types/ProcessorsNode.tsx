// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import type { IData } from "../FlowClick";
import Node from "./Node";
import ProcessorIcon from "~/components/assets/svg/processor.svg";
import { handleStyle } from "./Node";
import { memo } from "react";
import { Handle, Position } from "reactflow";

const ProcessorsNode = ({ data }: { data: IData }) => {
	return (
		<Node
			icon={<ProcessorIcon />}
			data={data}
			type="processor"
			handle1={<Handle type="target" position={Position.Left} style={handleStyle} />}
			handle2={<Handle type="source" position={Position.Right} id="processor-a" style={handleStyle} />}
		/>
	);
};

export default memo(ProcessorsNode);
