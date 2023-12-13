// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "@jest/globals";

import dagre from "@dagrejs/dagre";
import { getSimpleCycles, johnson_simple_cycles } from "./getSimpleCycles";

describe("getSimpleCycles", () => {
	it("should return empty list for a empyt graph", () => {
		const cycles = getSimpleCycles(new dagre.graphlib.Graph({ directed: true }));
		expect(cycles).toHaveLength(0);
	});

	it("should return empty list for a DAG", () => {
		const g = buildGraph([
			["A", "B"],
			["A", "C"],
			["A", "D"],
			["B", "C"],
			["B", "D"],
		]);
		const cycles = getSimpleCycles(g);
		expect(cycles).toHaveLength(0);
	});

	it("should return empty list for a single-node graph", () => {
		const g = buildGraph([]);
		g.setNode("A", "A");
		const cycles = getSimpleCycles(g);
		expect(cycles).toHaveLength(0);
	});

	it("should return all cycles for a cyclic graph", () => {
		const g = buildGraph([
			["A", "B"],
			["B", "C"],
			["C", "A"],
		]);
		const want = [["A", "B", "C"]];
		const cycles = getSimpleCycles(g);
		compareCycleArrays(cycles, want);
	});

	it("should return self-loop cycles", () => {
		const g = buildGraph([
			["A", "A"],
			["B", "B"],
		]);
		const want = [["A"], ["B"]];
		const cycles = getSimpleCycles(g);
		compareCycleArrays(cycles, want);
	});

	it("should return all cycles for a graph", () => {
		const g = buildGraph([
			["1", "2"],
			["1", "5"],
			["1", "8"],
			["2", "3"],
			["2", "9"],
			["3", "1"],
			["3", "2"],
			["3", "4"],
			["3", "6"],
			["4", "5"],
			["5", "2"],
			["6", "4"],
		]);
		const want = [
			["1", "2", "3"],
			["1", "5", "2", "3"],
			["2", "3"],
			["2", "3", "4", "5"],
			["2", "3", "6", "4", "5"],
		];
		const cycles = johnson_simple_cycles(g, ["1", "2", "3", "4", "5", "6"]);
		compareCycleArrays(cycles, want);
	});

	it("should return all cycles for a complex graph", () => {
		const g = buildGraph([
			["1", "2"],
			["1", "5"],
			["1", "8"],
			["2", "3"],
			["2", "7"],
			["2", "9"],
			["3", "1"],
			["3", "2"],
			["3", "4"],
			["3", "6"],
			["4", "5"],
			["5", "2"],
			["6", "4"],
			["8", "9"],
			["9", "8"],
		]);
		const want = [
			["1", "2", "3"],
			["1", "5", "2", "3"],
			["2", "3"],
			["2", "3", "4", "5"],
			["2", "3", "6", "4", "5"],
			["8", "9"],
		];
		const cycles = getSimpleCycles(g);
		compareCycleArrays(cycles, want);
	});
});

function buildGraph(edges: [string, string][]): dagre.graphlib.Graph {
	const g = new dagre.graphlib.Graph({ directed: true });

	edges.forEach((edge) => {
		const [from, to] = edge;
		g.setNode(from, from);
		g.setNode(to, to);
		g.setEdge(from, to);
	});

	return g;
}

function areCyclesEqual(a: string[], b: string[]) {
	if (a.length !== b.length) return false;
	if (a.length === 0) return true;

	const i = b.indexOf(a[0] as string);
	const shiftedB = [...b.slice(i), ...b.slice(0, i)];

	for (let i = 0; i < a.length; i++) {
		if (a[i] !== shiftedB[i]) return false;
	}

	return true;
}

function compareCycleArrays(cycles: string[][], want: string[][]) {
	expect(cycles).toHaveLength(want.length);
	cycles.forEach((cycle) => {
		for (let i = 0; i < want.length; i++) {
			if (areCyclesEqual(cycle, want[i] as string[])) {
				want.splice(i, 1);
				return;
			}
		}
		throw new Error("unexpected cycle");
	});
	expect(want).toHaveLength(0);
}
