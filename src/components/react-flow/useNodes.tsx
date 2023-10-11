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
		return { x: 50, y: positionY !== undefined ? positionY : parentHeight / 2 };
	};

	const exporterPosition = (
		index: number,
		parentHeight: number,
		exporters: string[],
		processors: string[]
	): XYPosition => {
		const positionY = calcYPosition(index, parentHeight, exporters);
		const processorLength = (processors?.length ?? 0) * 200 + 260;
		return { x: processorLength, y: positionY !== undefined ? positionY : parentHeight / 2 };
	};

	keyTraces.map((traceItem) => {
		if (traceItem === "processors") {
			const processors = parentNode.processors;
			Array.isArray(processors) &&
				processors.length > 0 &&
				processors.map((processor, index) => {
					const id = `${pipelineName}-Processor-processorNode-${processor}`;

					nodesToAdd.push({
						id: id,
						parentNode: pipelineName,
						extent: "parent",
						type: "processorsNode",
						position: processorPosition(index, height || 100, processors),
						data: {
							label: processor,
							parentNode: pipelineName,
							type: "processors",
							height: childNodesHeight,
							id: id,
						},
						draggable: false,
					});
				});
		}
		if (traceItem === "receivers") {
			const receivers = parentNode.receivers;
			Array.isArray(receivers) &&
				receivers.length > 0 &&
				receivers.map((receiver, index) => {
					let isConnector = false;
					if (connectors && Object.keys(connectors).includes(receiver)) {
						isConnector = true;
					}
					const id = `${pipelineName}-Receiver-receiverNode-${receiver}`;

					nodesToAdd.push({
						id: id,
						parentNode: pipelineName,
						extent: "parent",
						type: "receiversNode",
						position: receiverPosition(index, height || 100, receivers),
						data: {
							label: receiver,
							parentNode: pipelineName,
							type: isConnector ? "connectors/receivers" : "receivers",
							height: childNodesHeight,
							id: id,
						},
						draggable: false,
					});
				});
		}
		if (traceItem === "exporters") {
			const exporters = parentNode.exporters;
			const processors = parentNode.processors;
			exporters?.map((exporter, index) => {
				let isConnector = false;
				if (connectors && Object.keys(connectors).includes(exporter)) {
					isConnector = true;
				}

				const id = `${pipelineName}-exporter-exporterNode-${exporter}`;
				nodesToAdd.push({
					id: id,
					parentNode: pipelineName,
					extent: "parent",
					type: "exportersNode",
					position: exporterPosition(index, height || 100, exporters, processors ?? []),
					data: {
						label: exporter,
						parentNode: pipelineName,
						type: isConnector ? "connectors/exporters" : "exporters",
						height: childNodesHeight,
						id: id,
					},
					draggable: false,
				});
			});
		}
	});
	return nodesToAdd;
};

export const useNodes = (value: IConfig) => {
	return useMemo(() => {
		const pipelines = value.service?.pipelines;
		const connectors = value.connectors;
		if (pipelines == null) {
			return;
		}

		const nodesToAdd: Node[] = [];
		let yOffset = 0;

		for (const [pipelineName, pipeline] of Object.entries(pipelines)) {
			const receivers = pipeline.receivers?.length ?? 0;
			const exporters = pipeline.exporters?.length ?? 0;
			const maxNodes = Math.max(receivers, exporters) || 1;
			const spaceBetweenParents = 40;
			const spaceBetweenNodes = 90;
			const totalSpacing = maxNodes * spaceBetweenNodes;
			const parentHeight = totalSpacing + maxNodes * childNodesHeight;

			nodesToAdd.push({
				id: pipelineName,
				type: "parentNodeType",
				position: { x: 0, y: yOffset },
				data: {
					label: pipelineName,
					parentNode: pipelineName,
					height: maxNodes === 1 ? parentHeight : parentHeight + spaceBetweenParents,
				},
				draggable: false,
				ariaLabel: pipelineName,
				expandParent: true,
			});
			const heights = nodesToAdd.filter((node) => node.type === "parentNodeType").map((node) => node.data.height);
			yOffset += heights[heights.length - 1] + spaceBetweenParents;
			const childNodes = createNode(pipelineName, pipeline, parentHeight + spaceBetweenParents, connectors);
			nodesToAdd.push(...childNodes);
		}
		return nodesToAdd;
	}, [value]);
};
