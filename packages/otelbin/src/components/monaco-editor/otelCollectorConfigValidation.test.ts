// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, test, it } from "@jest/globals";
import {
	findLineAndColumn,
	extractMainItemsData,
	extractServiceItems,
	findLeafs,
	type IValidateItem,
} from "./parseYaml";
import { capitalize, customValidate } from "./otelCollectorConfigValidation";
import { type IItem, getParsedValue } from "./parseYaml";
import type { editor } from "monaco-editor";

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
`
		.trim()
		.replaceAll(/\t/g, "  ") as string,
} as const;

// Tested with random strings
test("capitalize and remove s", () => {
	expect(capitalize("exporters")).toBe("Exporter");
	expect(capitalize("processors")).toBe("Processor");
	expect(capitalize("receivers")).toBe("Receiver");
	expect(capitalize("extensions")).toBe("Extension");
	expect(capitalize("service")).toBe("Service");
	expect(capitalize("connectors")).toBe("Connector");
	expect(capitalize("log")).toBe("Log");
	expect(capitalize("")).toBe("");
});

// Tested with random strings
test("find Line And Column of the given offset in a string", () => {
	expect(findLineAndColumn("hello\nworld", 6)).toEqual({ line: 2, column: 1 });
	expect(findLineAndColumn("hello\nworld", 0)).toEqual({ line: 1, column: 1 });
	expect(findLineAndColumn("hello\nworld", 5)).toEqual({ line: 1, column: 6 });
	expect(findLineAndColumn("hello\nworld", 100)).toEqual({ line: 0, column: 0 });
	expect(findLineAndColumn("hello\nworld", -1)).toEqual({ line: 0, column: 0 });
	expect(findLineAndColumn("hello\nworld", 1)).toEqual({ line: 1, column: 2 });
	expect(findLineAndColumn("hello\nworld", 2)).toEqual({ line: 1, column: 3 });
	expect(findLineAndColumn("hello\nworld", 3)).toEqual({ line: 1, column: 4 });
	expect(findLineAndColumn("hello\nworld", 4)).toEqual({ line: 1, column: 5 });
	expect(findLineAndColumn("hello\nworld", 5)).toEqual({ line: 1, column: 6 });
	expect(findLineAndColumn("hello\nworld", 6)).toEqual({ line: 2, column: 1 });
	expect(findLineAndColumn("hello\nworld", 7)).toEqual({ line: 2, column: 2 });
	expect(findLineAndColumn("hello\nworld", 8)).toEqual({ line: 2, column: 3 });
	expect(findLineAndColumn("hello\nworld", 9)).toEqual({ line: 2, column: 4 });
	expect(findLineAndColumn("hello\nworld", 10)).toEqual({ line: 2, column: 5 });
	expect(findLineAndColumn("hello\nworld", 11)).toEqual({ line: 2, column: 6 });
	expect(findLineAndColumn("hello\nworld", 12)).toEqual({ line: 0, column: 0 });
});

// Tested with brief editorBinding.fallback
describe("extractMainItemsData", () => {
	it("should correctly extract level 1 and leve2 key value pairs with level2 offset", () => {
		const yaml = editorBinding.fallback;
		const docElements = getParsedValue(yaml);
		const result = extractMainItemsData(docElements);

		const expectedOutput: IValidateItem = {
			receivers: [{ source: "otlp", offset: 13 }],
			processors: [{ source: "batch", offset: 33 }],
		};

		expect(result).toEqual(expectedOutput);
	});

	it("should should return empty object with empty array input", () => {
		const result = extractMainItemsData([]);

		const expectedOutput: IValidateItem = {};

		expect(result).toEqual(expectedOutput);
	});
});

// Tested with brief editorBinding.fallback
describe("findLeafs", () => {
	it("should return leaf level and the parent of the leaf with offsets for the given yaml item", () => {
		const yaml = editorBinding.fallback;
		const docElements = getParsedValue(yaml);
		const yamlItems = extractServiceItems(docElements);

		const result = findLeafs(yamlItems, docElements.filter((item: IItem) => item.key.source === "service")[0], {});
		expect(result).toEqual({
			extensions: [
				{ source: "health_check", offset: 64 },
				{ source: "pprof", offset: 78 },
				{ source: "zpages", offset: 85 },
			],
			receivers: [{ source: "otlp", offset: 136 }],
			processors: [{ source: "batch", offset: 161 }],
			exporters: [{ source: "otlp", offset: 186 }],
		});
	});

	it("should return an empty object if yamlItems is empty", () => {
		const result = findLeafs([]);

		expect(result).toEqual({});
	});

	it("should return an empty object if yamlItems is undefined", () => {
		const result = findLeafs(undefined);

		expect(result).toEqual({});
	});
});

// Tested with a simple example
describe("customValidate", () => {
	it("should compare mainItemsData with serviceItemsData and add to errorMarkers", () => {
		const mainItemsData = {
			connectors: [{ source: "item2", offset: 1 }],
			exporters: [{ source: "item3", offset: 2 }],
			extensions: [{ source: "item5", offset: 3 }],
			receivers: [{ source: "item6E", offset: 4 }],
		};
		const serviceItemsData = {
			exporters: [{ source: "item3", offset: 3 }],
			extensions: [{ source: "item5E", offset: 4 }],
			receivers: [{ source: "item6", offset: 5 }],
		};

		const errorMarkers: editor.IMarkerData[] = [];
		const totalErrors = { customErrors: [], customWarnings: [] };
		const configData = editorBinding.fallback;

		customValidate(mainItemsData, serviceItemsData, errorMarkers, totalErrors, configData);

		expect(errorMarkers).toEqual([
			{
				startLineNumber: 1,
				endLineNumber: 0,
				startColumn: 5,
				endColumn: 11,
				severity: 8,
				message: 'Extension "item5E" is not defined.',
			},
			{
				startLineNumber: 1,
				endLineNumber: 0,
				startColumn: 4,
				endColumn: 9,
				severity: 4,
				message: 'Extension "item5" is unused.',
			},
			{
				startLineNumber: 1,
				endLineNumber: 0,
				startColumn: 6,
				endColumn: 11,
				severity: 8,
				message: 'Receiver "item6" is not defined.',
			},
			{
				startLineNumber: 1,
				endLineNumber: 0,
				startColumn: 5,
				endColumn: 11,
				severity: 4,
				message: 'Receiver "item6E" is unused.',
			},
		]);
		expect(totalErrors).toEqual({
			customErrors: ['Extension "item5E" is not defined. (line 1)', 'Receiver "item6" is not defined. (line 1)'],
			customWarnings: ['Extension "item5" is unused. (line 1)', 'Receiver "item6E" is unused. (line 1)'],
		});
	});
});
