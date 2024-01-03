// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import Dagre from "@dagrejs/dagre";
import { useMemo } from "react";
import { type Node, type Edge } from "reactflow";
import { getSimpleCycles } from "./getSimpleCycles";

export enum MarkerType {
	Arrow = "arrow",
	ArrowClosed = "arrowclosed",
}

export const useLayout = (nodes: Node[], edges: Edge[]) => {
	return useMemo(() => {
		return getLayoutedElements(nodes, edges);
	}, [nodes, edges]);
};

// export const useLayoutServerSide = (nodes: Node[], edges: Edge[]) => {
// 	return getLayoutedElements(nodes, edges);
// };
interface ErrorEdge {
	from: string;
	to: string;
	centerX: number;
	centerY: number;
	offset: number;
}

const dagrePosition2FlowPosition = ({
	x,
	y,
	height,
	width,
}: {
	x: number;
	y: number;
	height: number;
	width: number;
}) => {
	// shift the dagre node position (anchor is center) to matche the React Flow node anchor point (top left).
	return { x: x - width / 2, y: y - height / 2 };
};

export const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
	if (!nodes.length || !edges.length) {
		return { nodes, edges };
	}

	const g = new Dagre.graphlib.Graph({ directed: true }).setDefaultEdgeLabel(() => ({}));
	g.setGraph({ rankdir: "LR" });

	const pipelineNodes = nodes.filter((node) => node.type === "parentNodeType");
	const otherNodes = nodes.filter((node) => node.type !== "parentNodeType");

	edges.forEach((edge) => {
		if (edge.data?.sourcePipeline && edge.data?.targetPipeline) {
			g.setEdge(edge.data.sourcePipeline, edge.data.targetPipeline);
		}
	});

	pipelineNodes.forEach((node) => {
		g.setNode(node.id, { width: node.data?.width, height: node.data?.height });
	});

	Dagre.layout(g);

	const layoutedPipelineNodes = pipelineNodes.map((node) => {
		return { ...node, position: dagrePosition2FlowPosition(g.node(node.id)) };
	});

	const layoutedNodes = [...layoutedPipelineNodes, ...otherNodes];
	const layoutedEdges = Dagre.graphlib.alg.isAcyclic(g)
		? edges
		: layoutEdgesWithCycles({ layoutedPipelineNodes, edges, g });

	return { nodes: layoutedNodes, edges: layoutedEdges };
};

function layoutEdgesWithCycles({
	layoutedPipelineNodes,
	edges,
	g,
}: {
	layoutedPipelineNodes: Node[];
	edges: Edge[];
	g: Dagre.graphlib.Graph;
}) {
	const padding = 30;

	let maxBottomY = -Infinity;
	layoutedPipelineNodes.forEach((node) => {
		const { y } = node.position;
		const { height } = node.data as { height: number; width: number };

		const bottomY = y + height; // Y of bottom line of the pipelineNode

		maxBottomY = bottomY > maxBottomY ? bottomY : maxBottomY;
	});

	// find out edges with right to left direction in cycles
	const cyclicErrorEdges: ErrorEdge[] = [];
	getSimpleCycles(g).forEach((cycle, cycleIdx) => {
		for (let i = 0; i < cycle.length; i++) {
			const from = cycle[i] as string;
			const to = cycle[(i + 1) % cycle.length] as string;

			const fromPos = dagrePosition2FlowPosition(g.node(from));
			const toPos = dagrePosition2FlowPosition(g.node(to));

			if (fromPos.x >= toPos.x) {
				cyclicErrorEdges.push({
					from,
					to,
					centerX: toPos.x + (fromPos.x - toPos.x) / 2,
					centerY: maxBottomY + (cycleIdx + 1) * padding, // avoid overlap of horizontal lines
					offset: (cycleIdx + 1) * padding, // avoid overlap of vertical lines
				});
				break;
			}
		}
	});

	// XXX: React Flow render markerEnd as marker-end of path tag
	// CSS variable doesn't work here
	const color = getComputedStyle(document.documentElement).getPropertyValue("--color-critical-default");

	return edges.map((edge) => {
		for (let i = 0; i < cyclicErrorEdges.length; i++) {
			const { from, to, centerX, centerY, offset } = cyclicErrorEdges[i] as ErrorEdge;

			if (edge.data?.sourcePipeline === from && edge.data?.targetPipeline === to) {
				return {
					...edge,
					type: "cyclicErrorEdge",
					markerEnd: {
						type: MarkerType.Arrow,
						width: 20,
						height: 25,
						color,
					},
					style: {
						stroke: "var(--color-critical-default)",
						color: "var(--color-critical-default)",
					},
					pathOptions: {
						centerX,
						centerY,
						offset,
						borderRadius: 50,
					},
				};
			}
		}
		return edge;
	});
}
