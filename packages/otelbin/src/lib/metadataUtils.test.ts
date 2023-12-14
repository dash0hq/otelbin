// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "@jest/globals";
import { sortAndDeduplicate, extractComponents, calcScale, parseUrlFragment } from "./metadataUtils";
import type { IConfig } from "~/components/react-flow/dataType";
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

describe("parseUrlFragment", () => {
	it("Should correctly extract the URL fragment with '#' from the URL, decode it, and convert it to JSON.", () => {
		const url = new URL(
			"https://otelbin.io/?#config=**H_Learn_more_about_the_OpenTelemetry_Collector_via*N*H_https%3A%2F%2Fopentelemetry.io%2Fdocs%2Fcollector%2F*N*Nreceivers%3A*N__otlp%3A*N____protocols%3A*N______grpc%3A*N______http%3A*N*Nprocessors%3A*N__batch%3A*N*Nexporters%3A*N__otlp%3A*N____endpoint%3A_otelcol%3A4317*N*Nextensions%3A*N__health*_check%3A*N__pprof%3A*N__zpages%3A*N*Nservice%3A*N__extensions%3A_%5Bhealth*_check%2C_pprof%2C_zpages%5D*N__pipelines%3A*N____traces%3A*N______receivers%3A_%5Botlp%5D*N______processors%3A_%5Bbatch%5D*N______exporters%3A_%5Botlp%5D*N____metrics%3A*N______receivers%3A_%5Botlp%5D*N______processors%3A_%5Bbatch%5D*N______exporters%3A_%5Botlp%5D*N____logs%3A*N______receivers%3A_%5Botlp%5D*N______processors%3A_%5Bbatch%5D*N______exporters%3A_%5Botlp%5D*N______%7E"
		);

		const jsonData = parseUrlFragment(url);
		expect(jsonData).toEqual({
			receivers: { otlp: { protocols: { grpc: null, http: null } } },
			processors: { batch: null },
			exporters: { otlp: { endpoint: "otelcol:4317" } },
			extensions: {
				health_check: null,
				pprof: null,
				zpages: null,
			},
			service: {
				extensions: ["health_check", "pprof", "zpages"],
				pipelines: {
					traces: { receivers: ["otlp"], processors: ["batch"], exporters: ["otlp"] },
					metrics: { receivers: ["otlp"], processors: ["batch"], exporters: ["otlp"] },
					logs: { receivers: ["otlp"], processors: ["batch"], exporters: ["otlp"] },
				},
			},
		});
	});

	it("Should return an empty object if the URL fragment doesn't contain '#config='.", () => {
		const url = new URL(
			"https://otelbin.io/?#con=**H_Learn_more_about_the_OpenTelemetry_Collector_via*N*H_https%3A%2F%2Fopentelemetry.io%2Fdocs%2Fcollector%2F*N*Nreceivers%3A*N__otlp%3A*N____protocols%3A*N______grpc%3A*N______http%3A*N*Nprocessors%3A*N__batch%3A*N*Nexporters%3A*N__otlp%3A*N____endpoint%3A_otelcol%3A4317*N*Nextensions%3A*N__health*_check%3A*N__pprof%3A*N__zpages%3A*N*Nservice%3A*N__extensions%3A_%5Bhealth*_check%2C_pprof%2C_zpages%5D*N__pipelines%3A*N____traces%3A*N______receivers%3A_%5Botlp%5D*N______processors%3A_%5Bbatch%5D*N______exporters%3A_%5Botlp%5D*N____metrics%3A*N______receivers%3A_%5Botlp%5D*N______processors%3A_%5Bbatch%5D*N______exporters%3A_%5Botlp%5D*N____logs%3A*N______receivers%3A_%5Botlp%5D*N______processors%3A_%5Bbatch%5D*N______exporters%3A_%5Botlp%5D*N______%7E"
		);

		const jsonData = parseUrlFragment(url);
		expect(jsonData).toEqual({});
	});
});
