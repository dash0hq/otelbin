// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import type { IData } from "../FlowClick";
import Node from "./Node";
import ExporterIcon from "~/components/assets/svg/exporter.svg";
import { handleStyle } from "./Node";
import { memo } from "react";
import { Handle, Position } from "reactflow";

const ExportersNode = ({ data }: { data: IData }) => {
	return (
		<Node
			icon={<ExporterIcon />}
			data={data}
			type="exporter"
			handle2={<Handle type="target" position={Position.Left} style={handleStyle} />}
		/>
	);
};

export default memo(ExportersNode);
