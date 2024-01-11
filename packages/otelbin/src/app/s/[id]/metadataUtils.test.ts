// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "@jest/globals";
import {
	calcScale,
	drawConnectorEdges,
	drawEdges,
	extractComponents,
	sortAndDeduplicate,
	toUrlState,
} from "./metadataUtils";
import type { IConfig } from "~/components/react-flow/dataType";
import { editorBinding } from "../../../components/monaco-editor/editorBinding";
import { type Node } from "reactflow";

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

describe("calcScale", () => {
	const runTest = (parentNodes: Node[], expectedScale: string, offsetX: number, offsetY: number) => {
		it(`Should calculate the correct scale based on the maximum height or width of the visualization pipeline parent nodes to ensure they fit within the standard 1200x630 size of the generated Open Graph image.
		The absolute position system in Image Response base is in the middle left of the image, so we need to calculate the offset to center the image in the middle of the 1200x630 canvas.
		`, () => {
			const scale = calcScale(parentNodes).scale;
			const totalXOffset = calcScale(parentNodes).totalXOffset;
			const totalYOffset = calcScale(parentNodes).totalYOffset;
			expect(scale).toBe(expectedScale);
			expect(totalXOffset).toBe(offsetX);
			expect(totalYOffset).toBe(offsetY);
		});
	};

	runTest(
		[
			{ type: "parentNodeType", data: { height: 100, width: 300 }, position: { x: 100, y: 200 }, id: "1" },
			{ type: "parentNodeType", data: { height: 200, width: 300 }, position: { x: 200, y: 300 }, id: "2" },
			{ type: "parentNodeType", data: { height: 100, width: 400 }, position: { x: 200, y: 300 }, id: "3" },
			{ type: "parentNodeType", data: { height: 100, width: 400 }, position: { x: 210, y: 220 }, id: "4" },
			{ type: "parentNodeType", data: { height: 100, width: 500 }, position: { x: 0, y: 10 }, id: "5" },
			{ type: "parentNodeType", data: { height: 200, width: 300 }, position: { x: 10, y: 20 }, id: "6" },
			{ type: "parentNodeType", data: { height: 300, width: 200 }, position: { x: 20, y: 30 }, id: "7" },
			{ type: "parentNodeType", data: { height: 400, width: 600 }, position: { x: 30, y: 40 }, id: "8" },
			{ type: "parentNodeType", data: { height: 500, width: 400 }, position: { x: 40, y: 50 }, id: "9" },
			{ type: "parentNodeType", data: { height: 600, width: 500 }, position: { x: 50, y: 60 }, id: "10" },
		],
		"0.950",
		316.6812439261419,
		-325
	);

	runTest(
		[
			{ type: "parentNodeType", data: { height: 100, width: 500 }, position: { x: 70, y: 80 }, id: "1" },
			{ type: "parentNodeType", data: { height: 200, width: 600 }, position: { x: 80, y: 90 }, id: "2" },
			{ type: "parentNodeType", data: { height: 100, width: 600 }, position: { x: 0, y: 0 }, id: "3" },
			{ type: "parentNodeType", data: { height: 200, width: 200 }, position: { x: 0, y: 0 }, id: "4" },
		],
		"1.729",
		6.938775510204082,
		-145
	);

	runTest(
		[
			{ type: "parentNodeType", data: { height: 100, width: 250 }, position: { x: 100, y: 110 }, id: "1" },
			{ type: "parentNodeType", data: { height: 200, width: 350 }, position: { x: 110, y: 120 }, id: "2" },
			{ type: "parentNodeType", data: { height: 100, width: 300 }, position: { x: 120, y: 130 }, id: "3" },
			{
				type: "parentNodeType",
				data: { height: 100, width: 450 },
				position: { x: 130, y: 140 },
				id: "4",
			},
			{ type: "parentNodeType", data: { height: 100, width: 200 }, position: { x: 140, y: 150 }, id: "5" },
		],
		"2.450",
		4.897959183673469,
		-104.99999999999999
	);

	runTest(
		[{ type: "parentNodeType", data: { height: 100, width: 600 }, position: { x: 150, y: 160 }, id: "1" }],
		"1.960",
		6.122448979591836,
		-50
	);

	runTest([], "1", 0, 0);
});

enum MarkerType {
	Arrow = "arrow",
	ArrowClosed = "arrowclosed",
}

describe("drawEdges", () => {
	it("should calculate the correct edges and add position for each edge to draw them inside each parent node", () => {
		const parentNode = {
			type: "parentNodeType",
			data: {
				height: 100,
				width: 250,
				childNodes: [
					{
						type: "receiversNode",
						parentNode: "metrics",
						data: { height: 100 },
						position: { x: 200, y: 300 },
						id: "2",
					},
					{
						type: "processorsNode",
						parentNode: "metrics",
						data: { height: 100 },
						position: { x: 200, y: 300 },
						id: "3",
					},
					{
						type: "processorsNode",
						parentNode: "metrics",
						data: { height: 100 },
						position: { x: 210, y: 220 },
						id: "4",
					},
					{ type: "exportersNode", parentNode: "metrics", data: { height: 100 }, position: { x: 0, y: 10 }, id: "5" },
				],
			},
			position: { x: 100, y: 110 },
			id: "1",
			label: "metrics",
		};

		const markerEnd = { type: MarkerType.Arrow, color: "#9CA2AB", width: 20, height: 25 };
		const style = { stroke: "#9CA2AB" };

		const edges = [
			{
				id: "e1",
				source: "2",
				target: "3",
				type: "default",
				markerEnd: markerEnd,
				style: style,
				data: { type: "edge", sourceParent: "metrics", targetParent: "metrics" },
			},
			{
				id: "e2",
				source: "3",
				target: "4",
				type: "default",
				markerEnd: markerEnd,
				style: style,
				data: { type: "edge", sourceParent: "metrics", targetParent: "metrics" },
			},
			{
				id: "e3",
				source: "4",
				target: "5",
				type: "default",
				markerEnd: markerEnd,
				style: style,
				data: { type: "edge", sourceParent: "metrics", targetParent: "metrics" },
			},
		];

		const result = drawEdges(edges, parentNode);

		expect(result).toEqual([
			{
				edge: {
					id: "e1",
					source: "2",
					target: "3",
					type: "default",
					markerEnd: markerEnd,
					style: style,
					data: { type: "edge", sourceParent: "metrics", targetParent: "metrics" },
				},
				sourcePosition: { x: 330, y: 340 },
				targetPosition: { x: 190, y: 340 },
			},
			{
				edge: {
					id: "e2",
					source: "3",
					target: "4",
					type: "default",
					markerEnd: markerEnd,
					style: style,
					data: { type: "edge", sourceParent: "metrics", targetParent: "metrics" },
				},
				sourcePosition: { x: 330, y: 340 },
				targetPosition: { x: 200, y: 260 },
			},
			{
				edge: {
					id: "e3",
					source: "4",
					target: "5",
					type: "default",
					markerEnd: markerEnd,
					style: style,
					data: { type: "edge", sourceParent: "metrics", targetParent: "metrics" },
				},
				sourcePosition: { x: 340, y: 260 },
				targetPosition: { x: -10, y: 50 },
			},
		]);
	});
});

describe("drawConnectorEdges", () => {
	it("should calculate the correct connector edges and add position for each edge to draw them between parent nodes", () => {
		const parentNodes = [
			{
				type: "parentNodeType",
				data: {
					height: 100,
					width: 250,
					label: "logs",
					childNodes: [
						{
							type: "receiversNode",
							parentNode: "logs",
							data: { height: 100, type: "connectors/receivers" },
							position: { x: 200, y: 300 },
							id: "2",
						},
						{
							type: "processorsNode",
							parentNode: "logs",
							data: { height: 100 },
							position: { x: 200, y: 300 },
							id: "3",
						},
						{
							type: "processorsNode",
							parentNode: "logs",
							data: { height: 100 },
							position: { x: 210, y: 220 },
							id: "4",
						},
						{ type: "exportersNode", parentNode: "logs", data: { height: 100 }, position: { x: 0, y: 10 }, id: "5" },
					],
				},
				position: { x: 100, y: 110 },
				id: "1",
				label: "logs",
			},
			{
				type: "parentNodeType",
				data: {
					height: 200,
					width: 400,
					label: "metrics",
					childNodes: [
						{
							type: "receiversNode",
							parentNode: "metrics",
							data: { height: 100 },
							position: { x: 200, y: 300 },
							id: "6",
						},
						{
							type: "processorsNode",
							parentNode: "metrics",
							data: { height: 100 },
							position: { x: 200, y: 300 },
							id: "7",
						},
						{
							type: "processorsNode",
							parentNode: "metrics",
							data: { height: 100 },
							position: { x: 200, y: 300 },
							id: "8",
						},
						{
							type: "processorsNode",
							parentNode: "metrics",
							data: { height: 100 },
							position: { x: 210, y: 220 },
							id: "9",
						},
						{
							type: "exportersNode",
							parentNode: "metrics",
							data: { height: 100 },
							position: { x: 0, y: 10 },
							id: "10",
						},
						{
							type: "exportersNode",
							parentNode: "metrics",
							data: { height: 100, type: "connectors/exporters" },
							position: { x: 0, y: 10 },
							id: "11",
						},
					],
				},
				position: { x: 300, y: 410 },
				id: "12",
				label: "metrics",
			},
		];

		const markerEnd = { type: MarkerType.Arrow, color: "#9CA2AB", width: 20, height: 25 };
		const style = { stroke: "#9CA2AB" };

		const edges = [
			{
				id: "ec1",
				source: "11",
				target: "2",
				type: "default",
				markerEnd: markerEnd,
				style: style,
				data: { type: "connector", sourcePipeline: "metrics", targetPipeline: "logs" },
			},
		];

		const result = drawConnectorEdges(edges, parentNodes, 100);

		expect(result).toEqual([
			{
				edge: {
					id: "ec1",
					source: "11",
					target: "2",
					type: "default",
					markerEnd: markerEnd,
					style: style,
					data: { type: "connector", sourcePipeline: "metrics", targetPipeline: "logs" },
				},
				sourcePosition: { x: 540, y: 460 },
				targetPosition: { x: 390, y: 450 },
			},
		]);
	});
});
