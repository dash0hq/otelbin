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
interface ILeaf {
	source?: string;
	offset: number;
}

interface IValidateItem {
	[key: string]: ILeaf[];
}

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
	const mainItemsInfo: IValidateItem = {};
	const serviceItemsInfo: IValidateItem = {};
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
		customValidate(mainItemsInfo, serviceItemsInfo, errorMarkers, totalErrors, configData, monacoRef);

		model && monacoRef?.current?.editor.setModelMarkers(model, "json", errorMarkers);
	} catch (error: unknown) {
		const knownError = error as IJsYamlError;
		const errorLineNumber = knownError.mark.line;
		const errorMessage = knownError.reason || "Unknown error";
		const errorMarker = {
			startLineNumber: errorLineNumber || 0,
			endLineNumber: errorLineNumber || 0,
			startColumn: 0,
			endColumn: 0,
			severity: monacoRef?.current?.MarkerSeverity.Error || 1,
			message: errorMessage,
		};
		model && monacoRef?.current?.editor.setModelMarkers(model, "json", [errorMarker]);

		totalErrors.jsYamlError = knownError;
	}
	return totalErrors;
}

function customValidate(
	mainItemsInfo: IValidateItem,
	serviceItemsInfo: IValidateItem,
	errorMarkers: editor.IMarkerData[],
	totalErrors: IError,
	configData: string,
	monacoRef?: MonacoRefType
) {
	if (!totalErrors.jsYamlError) {
		const docObject = getParsedValue(configData);
		const mainKeys = docObject
			.filter((item: IItem) => item.key.source !== "service")
			.map((item: IItem) => item.key.source);
		const serviceItems = docObject.filter((item: IItem) => item.key.source === "service")[0]?.value.items;
		mainKeys.forEach((key: string) => {
			mainItemsInfo[key] =
				docObject
					.filter((item: IItem) => item.key.source === key)[0]
					?.value?.items?.map((item: IItem) => {
						return { source: item.key.source, offset: item.key.offset };
					}) || [];
		});
		findLeafs(serviceItems, docObject.filter((item: IItem) => item.key.source === "service")[0]);

		function findLeafs(yamlItems?: IItem[], parent?: IItem) {
			if (yamlItems?.length === 0) return;
			else if (Array.isArray(yamlItems)) {
				for (let i = 0; i < yamlItems.length; i++) {
					const item = yamlItems[i];
					if (item?.value) {
						if (item.value.source && parent) {
							const source = item.value.source;
							const offset = item.value.offset;
							const parentKey = parent.key.source;

							if (!serviceItemsInfo[parentKey]) {
								serviceItemsInfo[parentKey] = [];
							}
							if (!serviceItemsInfo[parentKey]?.some((item: ILeaf) => item.source === source)) {
								serviceItemsInfo[parentKey]?.push({ source, offset });
							}
						} else if (Array.isArray(item.value.items)) {
							if (item.key) {
								findLeafs(item.value.items, item);
							}
						}
					}
				}
			}
		}
		if (!mainItemsInfo) return totalErrors;
		validateSections(mainItemsInfo, serviceItemsInfo, configData, errorMarkers, totalErrors, monacoRef);
	}
}

function validateSections(
	mainInfo: IValidateItem,
	serviceInfo: IValidateItem,
	value: string,
	errorMarkers: editor.IMarkerData[],
	totalErrors: IError,
	monacoRef?: MonacoRefType
) {
	for (const key of Object.keys(mainInfo)) {
		const mainItems = mainInfo[key];
		const serviceItems = serviceInfo[key];

		if (!serviceItems) continue;

		serviceItems.forEach((item) => {
			if (
				!mainItems?.some((mainItem) => mainItem.source === item.source) &&
				!mainInfo["connectors"]?.some((mainItem) => mainItem.source === item.source)
			) {
				const errorMessage = `The ${item.source} is not present in the ${key} section`;
				const { line, column } = findLineAndColumn(value, item.offset);
				const endColumn = column + (item.source?.length || 0);

				const errorMarker = {
					startLineNumber: line || 0,
					endLineNumber: 0,
					startColumn: column || 0,
					endColumn: endColumn,
					severity: monacoRef?.current?.MarkerSeverity.Error || 1,
					message: errorMessage,
				};
				errorMarkers.push(errorMarker);
				totalErrors.customErrors?.push(errorMarker.message + " " + `(line ${line})`);
			}
		});
		mainItems?.forEach((item) => {
			if (!serviceItems.some((serviceItem) => serviceItem.source === item.source)) {
				const errorMessage = `The ${item.source} is not present in the service/pipelines ${key} section`;
				const { line, column } = findLineAndColumn(value, item.offset);
				const endColumn = column + (item.source?.length || 0);

				const errorMarker = {
					startLineNumber: line || 0,
					endLineNumber: 0,
					startColumn: column || 0,
					endColumn: endColumn,
					severity: monacoRef?.current?.MarkerSeverity.Warning || 1,
					message: errorMessage,
				};
				errorMarkers.push(errorMarker);

				totalErrors.customWarnings?.push(errorMarker.message + " " + `(line ${line})`);
			}
		});
	}
}

function findLineAndColumn(config: string, targetOffset?: number) {
	const lines = config.length > 0 ? config.split("\n") : [];

	let currentOffset = 0;
	let lineIndex = 0;
	let column = 0;

	if (lines.length === 0) {
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
