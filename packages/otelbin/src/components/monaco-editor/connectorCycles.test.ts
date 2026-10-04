// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "@jest/globals";
import { connectorCycleMessage, findConnectorCycles } from "./connectorCycles";

describe("findConnectorCycles", () => {
	it("finds the connector cycle from issue #258", () => {
		const cycles = findConnectorCycles({
			connectors: { "count/count_1": {}, "count/count_2": {} },
			service: {
				pipelines: {
					traces: { receivers: ["otlp"], exporters: ["count/count_1", "otlp"] },
					metrics: { receivers: ["count/count_1"], exporters: ["count/count_2"] },
					"metrics/count_the_counts": {
						receivers: ["count/count_2"],
						exporters: ["count/count_1"],
					},
				},
			},
		});

		expect(cycles).toEqual([
			{
				connectors: ["count/count_1", "count/count_2"],
				pipelines: ["metrics", "metrics/count_the_counts"],
				references: [
					{
						connector: "count/count_1",
						sourcePipeline: "metrics/count_the_counts",
						targetPipeline: "metrics",
					},
					{
						connector: "count/count_2",
						sourcePipeline: "metrics",
						targetPipeline: "metrics/count_the_counts",
					},
				],
			},
		]);
	});

	it("detects a self-loop", () => {
		const cycles = findConnectorCycles({
			connectors: { forward: {} },
			service: { pipelines: { traces: { receivers: ["forward"], exporters: ["forward"] } } },
		});

		expect(cycles).toHaveLength(1);
		expect(connectorCycleMessage(cycles[0]!)).toBe('Connector "forward" creates a cycle in pipeline "traces".');
	});

	it("returns independent strongly connected components as separate cycles", () => {
		const cycles = findConnectorCycles({
			connectors: { ab: {}, ba: {}, cd: {}, dc: {} },
			service: {
				pipelines: {
					a: { receivers: ["ba"], exporters: ["ab"] },
					b: { receivers: ["ab"], exporters: ["ba"] },
					c: { receivers: ["dc"], exporters: ["cd"] },
					d: { receivers: ["cd"], exporters: ["dc"] },
				},
			},
		});

		expect(cycles.map((cycle) => cycle.pipelines)).toEqual([
			["a", "b"],
			["c", "d"],
		]);
	});

	it("does not report acyclic fan-out", () => {
		const cycles = findConnectorCycles({
			connectors: { fanout: {} },
			service: {
				pipelines: {
					source: { exporters: ["fanout"] },
					targetA: { receivers: ["fanout"] },
					targetB: { receivers: ["fanout"] },
				},
			},
		});

		expect(cycles).toEqual([]);
	});

	it("ignores matching component names that are not declared connectors", () => {
		const cycles = findConnectorCycles({
			service: { pipelines: { traces: { receivers: ["otlp"], exporters: ["otlp"] } } },
		});

		expect(cycles).toEqual([]);
	});

	it.each([null, [], {}, { connectors: {} }, { connectors: {}, service: {} }])(
		"handles incomplete configuration %#",
		(config) => {
			expect(findConnectorCycles(config)).toEqual([]);
		}
	);
});

describe("connectorCycleMessage", () => {
	it("describes the involved pipelines and connectors", () => {
		expect(
			connectorCycleMessage({
				connectors: ["count/requests", "forward"],
				pipelines: ["logs", "metrics"],
				references: [],
			})
		).toBe('Connector cycle detected between pipelines "logs", "metrics" via "count/requests", "forward".');
	});
});
