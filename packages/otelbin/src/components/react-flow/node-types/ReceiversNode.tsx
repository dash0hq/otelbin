// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import type { IData } from "../FlowClick";
import Node from "./Node";
import ReceiverIcon from "~/components/assets/svg/receiver.svg";
import { handleStyle } from "./Node";
import { memo } from "react";
import { Handle, Position } from "reactflow";

const ReceiversNode = ({ data }: { data: IData }) => {
	return (
		<Node
			icon={<ReceiverIcon />}
			data={data}
			type="receiver"
			handle2={<Handle type="source" position={Position.Right} style={handleStyle} />}
		/>
	);
};

export default memo(ReceiversNode);
