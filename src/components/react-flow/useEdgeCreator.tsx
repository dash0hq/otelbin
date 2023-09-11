// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from "react";
import { MarkerType, type Edge, type Node } from "reactflow";

function useEdgeCreator(nodeIdsArray: Node[]) {
	return useMemo(() => {
		const edges: Edge[] = [];

		const calculateExportersNode = (exportersNodes: Node[], processorsNode: Node, index: number) => {
			exportersNodes.forEach((targetNode) => {
				if (!processorsNode || !targetNode) {
					return;
				}
				const sourceNodeId = processorsNode.id;
				const targetNodeId = targetNode.id;
				const edgeId = `edge-${sourceNodeId}-${targetNodeId}`;
				const edge: Edge = {
					id: edgeId,
					source: sourceNodeId!,
					target: targetNodeId,
					type: "default",
					markerEnd: {
						type: MarkerType.Arrow,
						color: "#9CA2AB",
						width: 20,
						height: 25,
					},
					style: {
						stroke: "#9CA2AB",
					},
				};
				edges.push(edge);
			});
		};
		const calculateProcessorsNode = (processorsNodes: Node[], index: number) => {
			for (let i = 0; i < processorsNodes.length; i++) {
				const sourceNode = processorsNodes[i];
				const targetNode = processorsNodes[i + 1];
				if (!sourceNode || !targetNode) {
					continue;
				}
				const sourceNodeId = sourceNode.id;
				const targetNodeId = targetNode.id;
				const edgeId = `edge-${sourceNodeId}-${targetNodeId}`;
				const edge: Edge = {
					id: edgeId,
					source: sourceNodeId,
					target: targetNodeId,
					type: "default",
					markerEnd: {
						type: MarkerType.Arrow,
						color: "#9CA2AB",
						width: 20,
						height: 25,
					},
					style: {
						stroke: "#9CA2AB",
					},
				};
				edges.push(edge);
			}
		};

		const calculateReceiversNode = (
			receiversNodes: Node[],
			firstprocessorsNode: Node | undefined,
			exportersNodes: Node[],
			index: number
		) => {
			if (!firstprocessorsNode) {
				receiversNodes.forEach((sourceNode) => {
					if (!sourceNode) {
						return;
					}

					const sourceNodeId = sourceNode.id;

					exportersNodes.forEach((exporterNode) => {
						if (!exporterNode) {
							return;
						}

						const targetNodeId = exporterNode.id;
						const edgeId = `edge-${sourceNodeId}-${targetNodeId}`;
						const edge: Edge = {
							id: edgeId,
							source: sourceNodeId,
							target: targetNodeId,
							type: "default",
							markerEnd: {
								type: MarkerType.Arrow,
								color: "#9CA2AB",
								width: 20,
								height: 25,
							},
							style: {
								stroke: "#9CA2AB",
							},
						};
						edges.push(edge);
					});
				});
			} else {
				receiversNodes.forEach((sourceNode) => {
					if (!sourceNode) {
						return;
					}

					const sourceNodeId = sourceNode.id;
					const targetNodeId = firstprocessorsNode.id;
					const edgeId = `edge-${sourceNodeId}-${targetNodeId}`;
					const edge: Edge = {
						id: edgeId,
						source: sourceNodeId,
						target: targetNodeId,
						type: "default",
						markerEnd: {
							type: MarkerType.Arrow,
							color: "#9CA2AB",
							width: 20,
							height: 25,
						},
						style: {
							stroke: "#9CA2AB",
						},
					};
					edges.push(edge);
				});
			}
		};

		const addEdgesToNodes = (nodes: Node[], index: number) => {
			const exportersNodes = nodes.filter((node) => node.type === "exportersNode");
			const processorsNodes = nodes.filter((node) => node.type === "processorsNode");
			const receiversNodes = nodes.filter((node) => node.type === "receiversNode");
			const firstprocessorsNode = processorsNodes[0] as Node;
			const lastprocessorsNode = processorsNodes[processorsNodes.length - 1] as Node;

			calculateExportersNode(exportersNodes, lastprocessorsNode, index);
			calculateProcessorsNode(processorsNodes, index);
			calculateReceiversNode(receiversNodes, firstprocessorsNode, exportersNodes, index);
		};

		const childNodes = (parentNode: string) => {
			return nodeIdsArray.filter((node) => node.parentNode === parentNode);
		};

		const parentNodes = nodeIdsArray.filter((node) => node.type === "parentNodeType").map((node) => node.data.label);
		if (!Array.isArray(nodeIdsArray) || nodeIdsArray.length < 2) {
			return [];
		}

		parentNodes.forEach((parentNode, index) => {
			const childNode = childNodes(parentNode);
			addEdgesToNodes(childNode, index);
		});

		return edges;
	}, [nodeIdsArray]);
}

export default useEdgeCreator;
