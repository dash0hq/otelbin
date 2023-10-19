// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "@jest/globals";
import type { IItem } from "./parseYaml";
import { getParsedValue, extractServiceItems, findPipelinesKeyValues } from "./parseYaml";

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

// Tested with brief editorBinding.fallback
describe("findPipelinesKeyValues", () => {
	it("should return return main key values (also with duplicated names) under service.pipelines with their offset in the config", () => {
		const yaml = editorBinding.fallback;
		const docObject = getParsedValue(yaml);
		const serviceItems: IItem[] | undefined = extractServiceItems(docObject);
		const pipeLineItems: IItem[] | undefined = serviceItems?.filter((item: IItem) => item.key.source === "pipelines");

		const result = findPipelinesKeyValues(
			pipeLineItems,
			docObject.filter((item: IItem) => item.key.source === "pipelines")[0],
			docObject.filter((item: IItem) => item.key.source === "service")[0],
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
		const result = findPipelinesKeyValues(undefined);

		expect(result).toEqual({});
	});
});
