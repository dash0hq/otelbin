// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import type { IData } from "./Node";
import Node from "./Node";
import ExporterIcon from "../../components/assets/svg/exporter.svg";
import ProcessorIcon from "../../components/assets/svg/processor.svg";
import ReceiverIcon from "../../components/assets/svg/receiver.svg";

export const ExportersNode = ({ data }: { data: IData }) => {
	return <Node icon={<ExporterIcon />} data={data} type="exporter" />;
};

export const ProcessorsNode = ({ data }: { data: IData }) => {
	return <Node icon={<ProcessorIcon />} data={data} type="processor" />;
};

export const ReceiversNode = ({ data }: { data: IData }) => {
	return <Node icon={<ReceiverIcon />} data={data} type="receiver" />;
};
