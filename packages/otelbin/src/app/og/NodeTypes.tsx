// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import type { IData } from "./Node";
import Node from "./Node";
import ExporterIcon from "./svg/exporter.svg";
import ProcessorIcon from "./svg/processor.svg";
import ReceiverIcon from "./svg/receiver.svg";

export const ExportersNode = ({ data }: { data: IData }) => {
	return <Node icon={<ExporterIcon />} data={data} type="exporter" />;
};

export const ProcessorsNode = ({ data }: { data: IData }) => {
	return <Node icon={<ProcessorIcon />} data={data} type="processor" />;
};

export const ReceiversNode = ({ data }: { data: IData }) => {
	return <Node icon={<ReceiverIcon />} data={data} type="receiver" />;
};
