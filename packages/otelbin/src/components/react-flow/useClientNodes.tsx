// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { type Node, type XYPosition } from "reactflow";
import type { IConfig, IPipeline } from "./dataType";
import { useMemo } from "react";

const childNodesHeight = 80;

const createNode = (pipelineName: string, parentNode: IPipeline, height: number, connectors?: object) => {
	const nodesToAdd: Node[] = [];
	const keyTraces = Object.keys(parentNode);

	const calcYPosition = (index: number, parentHeight: number, nodes: string[]): number | undefined => {
		const childNodePositions = [];
		const spaceBetweenNodes = (parentHeight - nodes.length * childNodesHeight) / (nodes.length + 1);

		for (let i = 0; i < nodes.length; i++) {
			const yPosition = spaceBetweenNodes + i * (childNodesHeight + spaceBetweenNodes);

			childNodePositions.push(yPosition);
		}
		switch (nodes.length) {
			case 0:
				return;
			case 1:
				return (parentHeight - 40) / 2 - 20;
			default:
				return childNodePositions[index];
		}
	};

	const processorPosition = (index: number, parentHeight: number, receivers: string[]): XYPosition => {
		const receiverLength = receivers.length ? 250 : 0;
		return { x: receiverLength + index * 200, y: (parentHeight - 40) / 2 - 20 };
	};

	const receiverPosition = (index: number, parentHeight: number, receivers: string[]): XYPosition => {
		const positionY = calcYPosition(index, parentHeight, receivers);
		return { x: 50, y: positionY ?? parentHeight / 2 };
	};

	const exporterPosition = (
		index: number,
		parentHeight: number,
		exporters: string[],
		processors: string[]
	): XYPosition => {
		const positionY = calcYPosition(index, parentHeight, exporters);
		const processorLength = (processors?.length ?? 0) * 200 + 260;
		return { x: processorLength, y: positionY ?? parentHeight / 2 };
	};
	const processors = parentNode.processors;
	const receivers = parentNode.receivers;
	const exporters = parentNode.exporters;
	keyTraces.forEach((traceItem) => {
		switch (traceItem) {
			case "processors":
				processors?.map((processor, index) => {
					const id = `${pipelineName}-Processor-processorNode-${processor}`;

					nodesToAdd.push({
						id: id,
						parentNode: pipelineName,
						extent: "parent",
						type: "processorsNode",
						position: processorPosition(index, height, processors),
						data: {
							label: processor,
							parentNode: pipelineName,
							type: "processors",
							height: childNodesHeight,
							id: id,
							position: processorPosition(index, height, processors),
						},
						draggable: false,
					});
				});
				break;
			case "receivers":
				receivers?.map((receiver, index) => {
					const isConnector = connectors?.hasOwnProperty(receiver) ? "connectors/receivers" : "receivers";
					const id = `${pipelineName}-Receiver-receiverNode-${receiver}`;

					nodesToAdd.push({
						id: id,
						parentNode: pipelineName,
						extent: "parent",
						type: "receiversNode",
						position: receiverPosition(index, height, receivers),
						data: {
							label: receiver,
							parentNode: pipelineName,
							type: isConnector,
							height: childNodesHeight,
							id: id,
							position: receiverPosition(index, height, receivers),
						},
						draggable: false,
					});
				});
				break;
			case "exporters":
				exporters?.map((exporter, index) => {
					const isConnector = connectors?.hasOwnProperty(exporter) ? "connectors/exporters" : "exporters";
					const id = `${pipelineName}-exporter-exporterNode-${exporter}`;
					nodesToAdd.push({
						id: id,
						parentNode: pipelineName,
						extent: "parent",
						type: "exportersNode",
						position: exporterPosition(index, height, exporters, processors ?? []),
						data: {
							label: exporter,
							parentNode: pipelineName,
							type: isConnector,
							height: childNodesHeight,
							id: id,
							position: exporterPosition(index, height, exporters, processors ?? []),
						},
						draggable: false,
					});
				});
				break;
		}
	});
	return nodesToAdd;
};

export const useClientNodes = (value: IConfig) => {
	return useMemo(() => calcNodes(value), [value]);
};

export const calcNodes = (value: IConfig) => {
	const pipelines = value?.service?.pipelines;
	const connectors = value?.connectors;
	if (pipelines == null) {
		return [];
	}

	const nodesToAdd: Node[] = [];

	for (const [pipelineName, pipeline] of Object.entries(pipelines)) {
		const receivers = pipeline.receivers?.length ?? 0;
		const exporters = pipeline.exporters?.length ?? 0;
		const maxNodes = Math.max(receivers, exporters) ?? 1;
		const spaceBetweenParents = 40;
		const spaceBetweenNodes = 90;
		const totalSpacing = maxNodes * spaceBetweenNodes;
		const parentHeight = totalSpacing + maxNodes * childNodesHeight;

		nodesToAdd.push({
			id: pipelineName,
			type: "parentNodeType",
			position: { x: 0, y: 0 },
			data: {
				label: pipelineName,
				parentNode: pipelineName,
				width: 430 + 200 * (pipeline.processors?.length ?? 0),
				height: maxNodes === 1 ? parentHeight : parentHeight + spaceBetweenParents,
				type: "parentNodeType",
				childNodes: createNode(pipelineName, pipeline, parentHeight + spaceBetweenParents, connectors),
			},
			draggable: false,
			ariaLabel: pipelineName,
			expandParent: true,
		});
		const childNodes = createNode(pipelineName, pipeline, parentHeight + spaceBetweenParents, connectors);
		nodesToAdd.push(...childNodes);
	}
	return nodesToAdd;
};
