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
	it("Should calculate the correct scale based on the maximum height or width of the visualization nodes to ensure they fit within the standard 1200x630 size of the generated Open Graph image.", () => {
		const nodes: Node[] = [
			{ type: "parentNodeType", data: { height: 100 }, position: { x: 0, y: 0 }, id: "1" },
			{ type: "parentNodeType", data: { height: 200 }, position: { x: 0, y: 0 }, id: "2" },
			{ type: "processorsNode", data: { height: 100 }, position: { x: 0, y: 0 }, id: "3" },
			{ type: "processorsNode", data: { height: 100 }, position: { x: 0, y: 0 }, id: "4" },
		];

		const edgeWidth = 10;
		const scale = calcScale(edgeWidth, nodes);
		expect(scale).toBe("1.270");
	});

	it("Should return 1 if there is no node.", () => {
		const nodes: Node[] = [];

		const edgeWidth = 10;
		const scale = calcScale(edgeWidth, nodes);
		expect(scale).toBe("1");
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
