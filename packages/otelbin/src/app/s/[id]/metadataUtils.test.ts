// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "@jest/globals";
import { calcScale, extractComponents, sortAndDeduplicate, toUrlState } from "./metadataUtils";
import type { IConfig } from "~/components/react-flow/dataType";
import { type Node } from "reactflow";
import { editorBinding } from "../../../components/monaco-editor/editorBinding";

describe("sortAndDeduplicate", () => {
	it("should sort and deduplicate an array of strings and return a comma separated string of components", () => {
		const array = ["count", "prometheus", "prometheus/metricsStore", "otlp", "otlp/metricsStore"];
		const result = sortAndDeduplicate(array);
		expect(result).toEqual("count, otlp, prometheus");
	});

	it("should return `-` with array length of 0", () => {
		const array: string[] = [];
		const result = sortAndDeduplicate(array);
		expect(result).toEqual("-");
	});
});

//The otel-col config json file
const jsonEditorBinding = {
	connectors: { jaeger: { protocols: [Object] } },
	receivers: { otlp: { protocols: [Object] } },
	processors: { batch: null },
	exporters: { otlp: { endpoint: "otelcol:4317" } },
	extensions: { health_check: null, pprof: null, zpages: null },
	service: {
		extensions: ["health_check", "pprof", "zpages"],
		pipelines: { traces: [Object], metrics: [Object], logs: [Object] },
	},
} as IConfig;

describe("extractComponents", () => {
	it("should extract all the components consisting exporters,processors,receivers except service from otel-col config json file correctly and return as an array of strings", () => {
		const result = extractComponents(jsonEditorBinding);
		expect(result).toEqual(["jaeger", "otlp", "batch", "otlp", "health_check", "pprof", "zpages"]);
	});
	it('should return ["-"] if the input json data is empty', () => {
		const result = extractComponents({} as IConfig);
		expect(result).toEqual(["-"]);
	});
});

describe("calcScale", () => {
	const edgeWidth = 10;

	const runTest = (nodes: Node[], expectedScale: string) => {
		it("Should calculate the correct scale based on the maximum height or width of the visualization nodes to ensure they fit within the standard 1200x630 size of the generated Open Graph image.", () => {
			const scale = calcScale(edgeWidth, nodes);
			expect(scale).toBe(expectedScale);
		});
	};

	runTest(
		[
			{ type: "parentNodeType", data: { height: 100 }, position: { x: 100, y: 200 }, id: "1" },
			{ type: "parentNodeType", data: { height: 200 }, position: { x: 200, y: 300 }, id: "2" },
			{ type: "processorsNode", parentNode: "metrics", data: { height: 100 }, position: { x: 200, y: 300 }, id: "3" },
			{ type: "processorsNode", parentNode: "metrics", data: { height: 100 }, position: { x: 210, y: 220 }, id: "4" },
			{ type: "processorsNode", parentNode: "logs", data: { height: 100 }, position: { x: 0, y: 10 }, id: "5" },
			{ type: "processorsNode", parentNode: "logs", data: { height: 200 }, position: { x: 10, y: 20 }, id: "6" },
			{ type: "processorsNode", parentNode: "logs", data: { height: 300 }, position: { x: 20, y: 30 }, id: "7" },
			{ type: "processorsNode", parentNode: "logs", data: { height: 400 }, position: { x: 30, y: 40 }, id: "8" },
			{ type: "processorsNode", parentNode: "logs", data: { height: 500 }, position: { x: 40, y: 50 }, id: "9" },
			{ type: "processorsNode", parentNode: "logs", data: { height: 600 }, position: { x: 50, y: 60 }, id: "10" },
		],
		"0.976"
	);

	runTest(
		[
			{ type: "parentNodeType", data: { height: 100 }, position: { x: 70, y: 80 }, id: "1" },
			{ type: "parentNodeType", data: { height: 200 }, position: { x: 80, y: 90 }, id: "2" },
			{ type: "exportersNode", parentNode: "metrics", data: { height: 100 }, position: { x: 0, y: 0 }, id: "3" },
			{ type: "receiversNode", parentNode: "logs", data: { height: 200 }, position: { x: 0, y: 0 }, id: "4" },
		],
		"1.270"
	);

	runTest(
		[
			{ type: "parentNodeType", data: { height: 100 }, position: { x: 100, y: 110 }, id: "1" },
			{ type: "parentNodeType", data: { height: 200 }, position: { x: 110, y: 120 }, id: "2" },
			{ type: "exportersNode", parentNode: "traces", data: { height: 100 }, position: { x: 120, y: 130 }, id: "3" },
			{
				type: "connectors/exporters",
				parentNode: "traces",
				data: { height: 100 },
				position: { x: 130, y: 140 },
				id: "4",
			},
			{ type: "receiversNode", parentNode: "traces", data: { height: 100 }, position: { x: 140, y: 150 }, id: "5" },
		],
		"1.270"
	);

	runTest(
		[
			{ type: "parentNodeType", data: { height: 100 }, position: { x: 150, y: 160 }, id: "1" },
			{ type: "parentNodeType", data: { height: 200 }, position: { x: 160, y: 170 }, id: "2" },
			{ type: "exportersNode", parentNode: "metrics", data: { height: 100 }, position: { x: 170, y: 180 }, id: "3" },
			{ type: "exportersNode", parentNode: "metrics", data: { height: 100 }, position: { x: 180, y: 190 }, id: "4" },
			{
				type: "connectors/receivers",
				parentNode: "metrics",
				data: { height: 100 },
				position: { x: 190, y: 200 },
				id: "5",
			},
			{ type: "receiversNode", parentNode: "metrics", data: { height: 100 }, position: { x: 200, y: 210 }, id: "6" },
		],
		"1.270"
	);

	runTest([], "1");
});

describe("toUrlState", () => {
	it("should return empty object if url hash is not provided", () => {
		const mockUrlWithoutHash = new URL("https://otelbin.io");
		expect(toUrlState(mockUrlWithoutHash, [])).toStrictEqual({});
	});

	it("should parse hash from URL and return urlState for the provided Binding", () => {
		const mockUrlWithHash = new URL("https://otelbin.io/#config=123");
		const result = toUrlState(mockUrlWithHash, [editorBinding]);

		expect(result).toStrictEqual({ config: 123 });
	});

	it("should parse hash from URL and return urlState for the provided Binding with distro selected condition in the URL", () => {
		const mockUrlWithHash = new URL(
			"https://otelbin.io/?#distro=otelcol-core~&distroVersion=v0.91.0~&config=**H_Learn_more_about_the_OpenTelemetry_Collector_"
		);
		const result = toUrlState(mockUrlWithHash, [editorBinding]);

		expect(result).toStrictEqual({ config: "# Learn more about the OpenTelemetry Collector " });
	});
});
