// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { schema } from "./JSONSchema";
import type { IAjvError, IError, IJsYamlError } from "./ErrorConsole";
import JsYaml from "js-yaml";
import Ajv from "ajv";
import type { ErrorObject } from "ajv";
import type { RefObject } from "react";
import type { editor } from "monaco-editor";
import { type Monaco } from "@monaco-editor/react";
import { type IItem, getParsedValue } from "./parseYaml";

type EditorRefType = RefObject<editor.IStandaloneCodeEditor | null>;
type MonacoRefType = RefObject<Monaco | null>;
export interface ILeaf {
	source?: string;
	offset: number;
}
export interface IValidateItem {
	[key: string]: ILeaf[];
}

let serviceItemsData: IValidateItem | undefined = {};

export function validateOtelCollectorConfigurationAndSetMarkers(
	configData: string,
	editorRef: EditorRefType,
	monacoRef: MonacoRefType
) {
	const ajv = new Ajv({ allErrors: true });
	const model = editorRef.current?.getModel();
	const ajvError: IAjvError[] = [];
	const totalErrors: IError = { ajvErrors: ajvError, customErrors: [], customWarnings: [] };
	const errorMarkers: editor.IMarkerData[] = [];
	const docObject = getParsedValue(configData);
	const mainItemsData: IValidateItem = extractMainItemsData(docObject);
	serviceItemsData = {};
	const serviceItems: IItem[] | undefined = extractServiceItems(docObject);
	serviceItemsData = findLeafs(serviceItems, docObject.filter((item: IItem) => item.key.source === "service")[0]);

	try {
		const jsonData = JsYaml.load(configData);
		const valid = ajv.validate(schema, jsonData);
		if (!valid) {
			const errors = ajv.errors;

			if (errors) {
				const validationErrors = errors.map((error: ErrorObject) => {
					const errorInfo = {
						line: null as number | null,
						column: null as number | null,
						message: error.message || "Unknown error",
					};

					if (error instanceof JsYaml.YAMLException) {
						errorInfo.line = error.mark.line + 1;
						errorInfo.column = error.mark.column + 1;
					}
					return errorInfo;
				});
				ajvError.push(...validationErrors);
			}
		}
	} catch (error: unknown) {
		const knownError = error as IJsYamlError;
		const errorLineNumber = knownError.mark.line;
		const errorMessage = knownError.reason || "Unknown error";
		const errorMarker = {
			startLineNumber: errorLineNumber || 0,
			endLineNumber: errorLineNumber || 0,
			startColumn: 0,
			endColumn: 0,
			severity: 8,
			message: errorMessage,
		};
		model && monacoRef?.current?.editor.setModelMarkers(model, "json", [errorMarker]);

		totalErrors.jsYamlError = knownError;
	}
	if (!totalErrors.jsYamlError) {
		customValidate(mainItemsData, serviceItemsData, errorMarkers, totalErrors, configData);
		model && monacoRef?.current?.editor.setModelMarkers(model, "json", errorMarkers);
	}
	return totalErrors;
}

export function customValidate(
	mainItemsData: IValidateItem,
	serviceItemsData: IValidateItem | undefined,
	errorMarkers: editor.IMarkerData[],
	totalErrors: IError,
	configData: string
) {
	if (!mainItemsData) return totalErrors;
	for (const key of Object.keys(mainItemsData)) {
		const mainItems = mainItemsData[key];
		const serviceItems = serviceItemsData && serviceItemsData[key];

		if (!serviceItems) continue;

		serviceItems.forEach((item) => {
			if (
				!mainItems?.some((mainItem) => mainItem.source === item.source) &&
				!mainItemsData["connectors"]?.some((mainItem) => mainItem.source === item.source)
			) {
				const errorMessage = `${capitalize(key)} "${item.source}" is not defined.`;
				const { line, column } = findLineAndColumn(configData, item.offset);
				const endColumn = column + (item.source?.length || 0);

				const errorMarker = {
					startLineNumber: line || 0,
					endLineNumber: 0,
					startColumn: column || 0,
					endColumn: endColumn,
					severity: 8,
					message: errorMessage,
				};
				errorMarkers.push(errorMarker);
				totalErrors.customErrors?.push(errorMarker.message + " " + `(line ${line})`);
			}
		});
		mainItems?.forEach((item) => {
			if (!serviceItems.some((serviceItem) => serviceItem.source === item.source)) {
				const errorMessage = `${capitalize(key)} "${item.source}" is unused.`;
				const { line, column } = findLineAndColumn(configData, item.offset);
				const endColumn = column + (item.source?.length || 0);

				const errorMarker = {
					startLineNumber: line || 0,
					endLineNumber: 0,
					startColumn: column || 0,
					endColumn: endColumn,
					severity: 4,
					message: errorMessage,
				};
				errorMarkers.push(errorMarker);

				totalErrors.customWarnings?.push(errorMarker.message + " " + `(line ${line})`);
			}
		});
	}
}

export function extractMainItemsData(docObject: IItem[]) {
	const mainItemsData: IValidateItem = {};

	const mainKeys = docObject
		.filter((item: IItem) => item.key.source !== "service")
		.map((item: IItem) => item.key.source);

	mainKeys.forEach((key: string) => {
		mainItemsData[key] =
			docObject
				.filter((item: IItem) => item.key.source === key)[0]
				?.value?.items?.map((item: IItem) => {
					return { source: item.key.source, offset: item.key.offset };
				}) || [];
	});
	return mainItemsData;
}

export function extractServiceItems(docObject: IItem[]) {
	const serviceItems = docObject.filter((item: IItem) => item.key.source === "service")[0]?.value.items;
	return serviceItems;
}

export function findLeafs(yamlItems?: IItem[], parent?: IItem) {
	if (yamlItems?.length === 0 || yamlItems === undefined) return {};
	else if (Array.isArray(yamlItems) && yamlItems.length > 0) {
		for (let i = 0; i < yamlItems.length; i++) {
			const item = yamlItems[i];
			if (item?.value) {
				if (item.value.source && parent) {
					const source = item.value.source;
					const offset = item.value.offset;
					const parentKey = parent.key.source;

					if (!serviceItemsData) return;
					if (!serviceItemsData[parentKey]) {
						serviceItemsData[parentKey] = [];
					}
					if (!serviceItemsData[parentKey]?.some((item: ILeaf) => item.source === source)) {
						serviceItemsData[parentKey]?.push({ source, offset });
					}
				} else if (Array.isArray(item.value.items)) {
					if (item.key) {
						findLeafs(item.value.items, item);
					}
				}
			}
		}
	}

	return serviceItemsData;
}

export function findLineAndColumn(config: string, targetOffset?: number) {
	const lines = config.length > 0 ? config.split("\n") : [];

	let currentOffset = 0;
	let lineIndex = 0;
	let column = 0;

	if (lines.length === 0 || (targetOffset && targetOffset < 0 && config.length)) {
		return { line: 0, column: 0 };
	}

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const lineLength = line?.length || 0;

		if (currentOffset + lineLength >= (targetOffset || 0)) {
			lineIndex = i + 1;
			column = (targetOffset || 0) - currentOffset + 1;
			break;
		}

		currentOffset += lineLength + 1;
	}

	return { line: lineIndex, column };
}

export function capitalize(input: string): string {
	if (!input) {
		return input;
	}
	const capitalized = input.charAt(0).toUpperCase() + input.slice(1);

	if (capitalized.endsWith("s")) {
		return capitalized.slice(0, -1);
	}

	return capitalized;
}
