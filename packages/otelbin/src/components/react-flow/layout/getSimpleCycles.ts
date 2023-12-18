// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

// The types of dagre API is incorret so we have to disable type check for this file.
//
// eslint-disable-next-line
// @ts-nocheck

import Dagre from "@dagrejs/dagre";

// getSimpleCycles use Johnson algorithm to find all the simple cycles of the graph.
// ref: https://www.cs.tufts.edu/comp/150GA/homeworks/hw1/Johnson%2075.PDF
export function getSimpleCycles(g: Dagre.graphlib.Graph) {
	const sccs = Dagre.graphlib.alg.tarjan(g);

	let cycles = [];
	sccs.forEach((scc) => {
		cycles = cycles.concat(johnsonSimpleCycles(g, scc));
	});

	return cycles;
}

// johnsonSimpleCycles finds all simple cycle in the strong component of the graph
export function johnsonSimpleCycles(g, scc) {
	const stack = [];
	const blocked = new Set();
	const blockedMap = new Map();

	const cycles = [];

	function unblock(n) {
		blocked.delete(n);
		blockedMap.get(n)?.forEach((v) => {
			if (blocked.has(v)) {
				unblock(v);
			}
		});
		blockedMap.set(n, []);
	}

	function circuit(cur, start, subgraph) {
		let f = false;

		stack.push(cur);
		blocked.add(cur);

		g
			.successors(cur)
			?.filter((n) => subgraph.includes(n))
			.forEach((node) => {
				if (node === start) {
					cycles.push([...stack]);
					f = true;
					return;
				}
				if (!blocked.has(node)) {
					if (circuit(node, start, subgraph)) f = true;
				}
			});

		if (f) {
			unblock(cur);
		} else {
			g
				.successors(cur)
				?.filter((n) => subgraph.includes(n))
				.forEach((node) => {
					if (!blockedMap.get(node)?.includes(cur)) {
						blockedMap.get(node)?.push(cur);
					}
				});
		}

		stack.pop();
		return f;
	}

	scc.forEach((start, i) => {
		blocked.clear();
		scc.forEach((v) => {
			blockedMap.set(v, []);
		});
		circuit(start, start, scc.slice(i));
	});

	return cycles;
}
