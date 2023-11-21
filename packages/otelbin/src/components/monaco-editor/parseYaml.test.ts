// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "@jest/globals";
import type { IItem, IYamlElement } from "./parseYaml";
import { getYamlDocument, extractServiceItems, findPipelinesKeyValues, parseYaml, selectConfigType } from "./parseYaml";

//The example contains pipelines with duplicated names (otlp and batch)
const editorBinding = {
	prefix: "",
	name: "config",
	fallback: `
receivers:
  otlp:
processors:
  batch:
service:
  extensions: [health_check, pprof, zpages]
  pipelines:
    traces:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]
    metrics:
      receivers: [otlp]
      processors: [batch]
      exporters: [otlp]
`
		.trim()
		.replaceAll(/\t/g, "  ") as string,
} as const;

//The example contains service key with no pipelines
const serviceTest = {
	prefix: "",
	name: "config",
	fallback: `
receivers:
  otlp:
processors:
  batch:
service:
  extensions: [health_check, pprof, zpages]
testItem1:
testItem2:
`
		.trim()
		.replaceAll(/\t/g, "  ") as string,
} as const;

// Tested with brief serviceTest.fallback
describe("parseYaml", () => {
	it("should return a minimal version of npm yaml Document consists all of the key values of yaml string with related offsets", () => {
		const yaml = serviceTest.fallback;
		const docElements = getYamlDocument(yaml);
		const result: IYamlElement[] | undefined = parseYaml(docElements);

		expect(result).toEqual([
			{
				key: "receivers",
				offset: 0,
				path: [
					"receivers",
				],
				value: [
					{
						key: "otlp",
						offset: 13,
						path: [
							"receivers",
							"otlp",
						],
						value: undefined,
					},
				],
			},
			{
				key: "processors",
				offset: 19,
				path: ["processors"],
				value: [
					{
						key: "batch",
						offset: 33,
						path: ["processors", "batch"],
						value: undefined,
					},
				],
			},
			{
				key: "service",
				offset: 40,
				path: ["service"],
				value: [
					{
						key: "extensions",
						offset: 51,
						path: ["service", "extensions"],
						value: [
							{
								key: "health_check",
								offset: 64,
								path: ["service", "extensions", "health_check"],
								value: "health_check",
							},
							{
								key: "pprof",
								offset: 78,
								path: ["service", "extensions", "pprof"],
								value: "pprof",
							},
							{
								key: "zpages",
								offset: 85,
								path: ["service", "extensions", "zpages"],
								value: "zpages",
							},
						],
					},
				],
			},
			{
				key: "testItem1",
				offset: 93,
				path: ["testItem1"],
				value: undefined,
			},
			{
				key: "testItem2",
				offset: 104,
				path: ["testItem2"],
				value: undefined,
			},
		]);
	});

	it("should return an empty array if docElements is empty", () => {
		const result = parseYaml([]);

		expect(result).toEqual([]);
	});
});

// Tested with brief serviceTest.fallback
describe("extractServiceItems", () => {
	it("should return service item in the doc object of the yaml parser", () => {
		const yaml = serviceTest.fallback;
		const docElements = getYamlDocument(yaml);
		const result: IItem[] | undefined = extractServiceItems(docElements);

		expect(result).toEqual([
			{
				key: { indent: 2, offset: 51, source: "extensions", type: "scalar" },
				sep: [
					{ indent: 2, offset: 61, source: ":", type: "map-value-ind" },
					{ indent: 2, offset: 62, source: " ", type: "space" },
				],
				start: [],
				value: {
					end: [
						{ indent: 2, offset: 91, source: "]", type: "flow-seq-end" },
						{ indent: 2, offset: 92, source: "\n", type: "newline" },
					],
					indent: 2,
					items: [
						{ start: [], value: { end: [], indent: 2, offset: 64, source: "health_check", type: "scalar" } },
						{
							start: [
								{ indent: 2, offset: 76, source: ",", type: "comma" },
								{ indent: 2, offset: 77, source: " ", type: "space" },
							],
							value: { end: [], indent: 2, offset: 78, source: "pprof", type: "scalar" },
						},
						{
							start: [
								{ indent: 2, offset: 83, source: ",", type: "comma" },
								{ indent: 2, offset: 84, source: " ", type: "space" },
							],
							value: { end: [], indent: 2, offset: 85, source: "zpages", type: "scalar" },
						},
					],
					offset: 63,
					start: { indent: 2, offset: 63, source: "[", type: "flow-seq-start" },
					type: "flow-collection",
				},
			},
		]);
	});

	it("should return an empty array if docElements is empty", () => {
		const result = extractServiceItems([]);

		expect(result).toEqual([]);
	});
});

// Tested with brief editorBinding.fallback
describe("findPipelinesKeyValues", () => {
	it("should return return main key values (also with duplicated names) under service.pipelines with their offset in the config", () => {
		const yaml = editorBinding.fallback;
		const docElements = getYamlDocument(yaml);
		const serviceItems: IItem[] | undefined = extractServiceItems(docElements);
		const pipeLineItems: IItem[] | undefined = serviceItems?.filter((item: IItem) => item.key?.source === "pipelines");

		const result = findPipelinesKeyValues(
			pipeLineItems,
			docElements.filter((item: IItem) => item.key?.source === "pipelines")[0],
			docElements.filter((item: IItem) => item.key?.source === "service")[0],
			{}
		);
		expect(result).toEqual({
			receivers: [
				{ source: "otlp", offset: 136, level1Parent: "traces" },
				{ source: "otlp", offset: 223, level1Parent: "metrics" },
			],
			processors: [
				{ source: "batch", offset: 161, level1Parent: "traces" },
				{ source: "batch", offset: 248, level1Parent: "metrics" },
			],
			exporters: [
				{ source: "otlp", offset: 186, level1Parent: "traces" },
				{ source: "otlp", offset: 273, level1Parent: "metrics" },
			],
		});
	});

	it("should return an empty object if yamlItems is empty", () => {
		const result = findPipelinesKeyValues([]);

		expect(result).toEqual({});
	});

	it("should return an empty object if yamlItems is undefined", () => {
		const result = findPipelinesKeyValues();

		expect(result).toEqual({});
	});
});

describe("selectConfigType", () => {
	it("should return relay.data if the config is a valid K8s ConfigMap", () => {
		const config = `
      kind: ConfigMap
      data:
        relay: testRelay
    `;
		expect(selectConfigType(config)).toBe("testRelay");
	});

	it("should return spec.config if the config is a valid OpenTelemetryCollector CRD", () => {
		const config = `
      kind: OpenTelemetryCollector
      spec:
        config: testConfig
    `;
		expect(selectConfigType(config)).toBe("testConfig");
	});

	it("should return the original config if it is not a valid K8s ConfigMap or OpenTelemetryCollector CRD", () => {
		const config = "invalidConfig";
		expect(selectConfigType(config)).toBe(config);
	});
});
