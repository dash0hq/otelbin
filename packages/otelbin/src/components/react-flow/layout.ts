// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import Dagre from "@dagrejs/dagre";
import { useMemo } from "react";
import type { Node, Edge } from "reactflow";

export const useLayout = (nodes: Node[], edges: Edge[]) => {
	return useMemo(() => {
		return getLayoutedElements(nodes, edges);
	}, [nodes, edges]);
};

export const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
	if (!nodes.length || !edges.length) {
		return { nodes, edges };
	}

	const g = new Dagre.graphlib.Graph().setDefaultEdgeLabel(() => ({}));
	g.setGraph({ rankdir: "LR", nodesep: 40 });

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
	const layouted = {
		nodes: [
			...pipelineNodes.map((node) => {
				// shift the dagre node position (anchor is center) to matche the React Flow node anchor point (top left).
				const { x, y, height, width } = g.node(node.id);
				return { ...node, position: { x: x - width / 2, y: y - height / 2 } };
			}),
			...otherNodes,
		],
		edges,
	};
	return layouted;
};
