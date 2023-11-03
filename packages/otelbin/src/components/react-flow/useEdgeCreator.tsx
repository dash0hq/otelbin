// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from "react";
import { MarkerType, type Edge, type Node } from "reactflow";

function createEdge(sourceNode: Node, targetNode: Node): Edge {
	const edgeId = `edge-${sourceNode.id}-${targetNode.id}`;
	return {
		id: edgeId,
		source: sourceNode.id,
		target: targetNode.id,
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
}

function useEdgeCreator(nodeIdsArray: Node[]) {
	return useMemo(() => {
		const edges: Edge[] = [];

		const calculateExportersNode = (exportersNodes: Node[], processorsNode: Node) => {
			exportersNodes.forEach((targetNode) => {
				if (!processorsNode || !targetNode) {
					return;
				}
				const edge = createEdge(processorsNode, targetNode);
				edges.push(edge);
			});
		};
		const calculateProcessorsNode = (processorsNodes: Node[]) => {
			for (let i = 0; i < processorsNodes.length; i++) {
				const sourceNode = processorsNodes[i];
				const targetNode = processorsNodes[i + 1];
				if (!sourceNode || !targetNode) {
					continue;
				}
				const edge = createEdge(sourceNode, targetNode);
				edges.push(edge);
			}
		};

		const calculateReceiversNode = (
			receiversNodes: Node[],
			firstProcessorsNode: Node | undefined,
			exportersNodes: Node[]
		) => {
			if (!firstProcessorsNode) {
				receiversNodes.forEach((sourceNode) => {
					if (!sourceNode) {
						return;
					}
					exportersNodes.forEach((exporterNode) => {
						if (!exporterNode) {
							return;
						}
						const edge = createEdge(sourceNode, exporterNode);
						edges.push(edge);
					});
				});
			} else {
				receiversNodes.forEach((sourceNode) => {
					if (!sourceNode) {
						return;
					}
					const edge = createEdge(sourceNode, firstProcessorsNode);
					edges.push(edge);
				});
			}
		};

		const addEdgesToNodes = (nodes: Node[]) => {
			const exportersNodes = nodes.filter((node) => node.type === "exportersNode");
			const processorsNodes = nodes.filter((node) => node.type === "processorsNode");
			const receiversNodes = nodes.filter((node) => node.type === "receiversNode");
			const firstProcessorsNode = processorsNodes[0] as Node;
			const lastProcessorsNode = processorsNodes[processorsNodes.length - 1] as Node;

			calculateExportersNode(exportersNodes, lastProcessorsNode);
			calculateProcessorsNode(processorsNodes);
			calculateReceiversNode(receiversNodes, firstProcessorsNode, exportersNodes);
		};

		const childNodes = (parentNode: string) => {
			return nodeIdsArray.filter((node) => node.parentNode === parentNode);
		};

		const parentNodes = nodeIdsArray.filter((node) => node.type === "parentNodeType").map((node) => node.data.label);
		if (!Array.isArray(nodeIdsArray) || nodeIdsArray.length < 2) {
			return [];
		}

		parentNodes.forEach((parentNode) => {
			const childNode = childNodes(parentNode);
			addEdgesToNodes(childNode);
		});

		return edges;
	}, [nodeIdsArray]);
}

export default useEdgeCreator;
