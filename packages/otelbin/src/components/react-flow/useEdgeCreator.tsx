// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { useMemo } from "react";
import { type Edge, type Node } from "reactflow";

export enum MarkerType {
	Arrow = "arrow",
	ArrowClosed = "arrowclosed",
}

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
		data: {
			type: "edge",
			sourceParent: sourceNode.parentNode,
			targetParent: targetNode.parentNode,
		},
	};
}

function createConnectorEdge(sourceNode: Node, targetNode: Node): Edge {
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
		data: {
			type: "connector",
			sourcePipeline: sourceNode.parentNode,
			targetPipeline: targetNode.parentNode,
		},
	};
}

export function calcEdges(nodeIdsArray: Node[]) {
	const edges: Edge[] = [];

	const calculateExportersNode = (exportersNodes: Node[], processorsNode: Node) => {
		if (!processorsNode) {
			return;
		}

		const newEdges = exportersNodes
			.filter((targetNode) => targetNode !== undefined)
			.map((targetNode) => createEdge(processorsNode, targetNode));

		edges.push(...newEdges);
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
		const processNode = (sourceNode: Node, targetNode: Node) => {
			if (!sourceNode || !targetNode) {
				return;
			}

			const edge = createEdge(sourceNode, targetNode);
			edges.push(edge);
		};

		if (!firstProcessorsNode) {
			receiversNodes.forEach((sourceNode) => {
				exportersNodes.forEach((exporterNode) => processNode(sourceNode, exporterNode));
			});
		} else {
			receiversNodes.forEach((sourceNode) => processNode(sourceNode, firstProcessorsNode));
		}
	};

	const calculateConnectorsNode = (nodes: Node[]) => {
		const connectorsAsExporter = nodes.filter((node) => node?.data?.type === "connectors/exporters");
		const connectorsAsReceiver = nodes.filter((node) => node?.data?.type === "connectors/receivers");

		connectorsAsExporter.forEach((sourceNode) => {
			const targetNode = connectorsAsReceiver.find((node) => node?.data?.label === sourceNode?.data?.label);

			if (targetNode) {
				edges.push(createConnectorEdge(sourceNode, targetNode));
			}
		});
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

	calculateConnectorsNode(
		nodeIdsArray.filter((node) => node.type === "exportersNode" || node.type === "receiversNode")
	);

	return edges;
}
function useEdgeCreator(nodeIdsArray: Node[]) {
	return useMemo(() => {
		return calcEdges(nodeIdsArray);
	}, [nodeIdsArray]);
}

export default useEdgeCreator;
