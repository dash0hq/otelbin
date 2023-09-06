// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { type Node, type XYPosition } from "reactflow";
import type { IConfig, IPipeline } from "./dataType";
import { useMemo } from "react";

const createNode = (pipelineName: string, parentNode: IPipeline, height: number) => {
	const nodesToAdd: Node[] = [];
	const keyTraces = Object.keys(parentNode);

	const calculateValue = (parentHeight: number, index: number): number => {
		const offset = 50;
		const offsetX = 75;
		const value = parentHeight / 2;

		return index === 0
			? value + offset * index + 60
			: index % 2 !== 0
			? value - offset * index
			: value + offsetX * index;
	};

	const calculateReceiverYposition = (receivers: string[], index: number, parentHeight: number): number | undefined => {
		if (receivers.length === 0) return;

		return receivers.length === 1 ? parentHeight / 2 : calculateValue(parentHeight, index);
	};

	const processorPosition = (index: number, parentHeight: number, receivers: string[]): XYPosition => {
		const receiverLength = receivers.length ? 250 : 0;
		return { x: receiverLength + index * 200, y: parentHeight / 2 };
	};

	const receiverPosition = (index: number, parentHeight: number, receivers: string[]): XYPosition => {
		const positionY = calculateReceiverYposition(receivers, index, parentHeight);
		return { x: 50, y: positionY !== undefined ? positionY : parentHeight / 2 };
	};

	const exporterPosition = (
		index: number,
		parentHeight: number,
		exporters: string[],
		processors: string[]
	): XYPosition => {
		const positionY = calculateReceiverYposition(exporters, index, parentHeight);
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
							height: 80,
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
							type: "receivers",
							height: 80,
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
						type: "exporters",
						height: 80,
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
		if (pipelines == null) {
			return [];
		}

		const nodesToAdd: Node[] = [];
		let yOffset = 0;

		for (const [pipelineName, pipeline] of Object.entries(pipelines)) {
			const receivers = pipeline.receivers?.length ?? 0;
			const exporters = pipeline.exporters?.length ?? 0;

			const maxNumberOfVerticalElements = Math.max(receivers, exporters) || 1;
			const height = maxNumberOfVerticalElements * 100;
			const extraSpacing = 200;

			nodesToAdd.push({
				id: pipelineName,
				type: "parentNodeType",
				position: { x: 0, y: yOffset },
				data: { label: pipelineName, parentNode: pipelineName },
				draggable: false,
				ariaLabel: pipelineName,
				expandParent: true,
			});
			yOffset += height + extraSpacing;

			const childNodes = createNode(pipelineName, pipeline, height);
			nodesToAdd.push(...childNodes);
		}
		return nodesToAdd;
	}, [value]);
};
