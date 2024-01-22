// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { schema } from "./JSONSchema";
import type { IAjvError, IError, IJsYamlError } from "./ValidationErrorConsole";
import JsYaml, { FAILSAFE_SCHEMA } from "js-yaml";
import Ajv from "ajv";
import type { ErrorObject } from "ajv";
import { type RefObject } from "react";
import type { editor } from "monaco-editor";
import { type Monaco } from "@monaco-editor/react";
import {
	type IItem,
	type IYamlElement,
	type IValidateItem,
	getYamlDocument,
	extractMainItemsData,
	extractServiceItems,
	findLeafs,
	findLineAndColumn,
	parseYaml,
} from "./parseYaml";
import type { ValidationState } from "../validation/useServerSideValidation";

type EditorRefType = RefObject<editor.IStandaloneCodeEditor | null>;
type MonacoRefType = RefObject<Monaco | null>;
let serviceItemsData: IValidateItem | undefined = {};

export function validateOtelCollectorConfigurationAndSetMarkers(
	configData: string,
	editorRef: EditorRefType,
	monacoRef: MonacoRefType,
	isServerSideValidationEnabled: boolean,
	serverSideValidationResult?: ValidationState
) {
	const ajv = new Ajv({ allErrors: true });
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	require("ajv-errors")(ajv);
	const model = editorRef.current?.getModel();
	const ajvError: IAjvError[] = [];
	const totalErrors: IError = { ajvErrors: ajvError, customErrors: [], customWarnings: [] };
	const errorMarkers: editor.IMarkerData[] = [];
	const docElements = getYamlDocument(configData);
	const parsedYamlConfig = parseYaml(docElements);
	const mainItemsData: IValidateItem = extractMainItemsData(docElements);
	const serviceItems: IItem[] | undefined = extractServiceItems(docElements);
	serviceItemsData = {};
	serviceItemsData = findLeafs(
		serviceItems,
		docElements.filter((item: IItem) => item.key?.source === "service")[0],
		serviceItemsData
	);
	const serverSideValidationPath = serverSideValidationResult?.result?.path ?? [];

	try {
		const jsonData = JsYaml.load(configData, { schema: FAILSAFE_SCHEMA });
		const valid = ajv.validate(schema, jsonData);
		if (!valid) {
			const errors = ajv.errors;

			if (errors) {
				const validationErrors = errors.map((error: ErrorObject) => {
					const errorPath = error.instancePath.split("/").slice(1);
					const errorElement = findErrorElement(errorPath, parsedYamlConfig);
					const { line, column } = findLineAndColumn(configData, errorElement?.offset);
					const errorInfo = {
						line: line as number | null,
						column: column as number | null,
						message: error.message || "Unknown error",
					};
					errorMarkers.push({
						startLineNumber: errorInfo.line ?? 0,
						endLineNumber: 0,
						startColumn: errorInfo.column ?? 0,
						endColumn: errorInfo.column ?? 0,
						severity: 8,
						message: errorInfo.message,
					});
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
		const errorLineNumber = knownError.mark?.line;
		const errorMessage = knownError.reason ?? "Unknown error";
		const errorMarker = {
			startLineNumber: errorLineNumber ?? 0,
			endLineNumber: errorLineNumber ?? 0,
			startColumn: 0,
			endColumn: 0,
			severity: 8,
			message: errorMessage,
		};
		model && monacoRef?.current?.editor.setModelMarkers(model, "json", [errorMarker]);

		totalErrors.jsYamlError = knownError;
	}
	if (!totalErrors.jsYamlError) {
		customValidate(
			mainItemsData,
			serviceItemsData,
			errorMarkers,
			totalErrors,
			configData,
			isServerSideValidationEnabled
		);
		const totalBrowserSideErrorsCount = (totalErrors.ajvErrors?.length ?? 0) + (totalErrors.customErrors?.length ?? 0);
		if (!totalBrowserSideErrorsCount) {
			const serverSideErrorElement = findErrorElement(serverSideValidationPath, parsedYamlConfig);
			const { line, column } = findLineAndColumn(configData, serverSideErrorElement?.offset);
			totalErrors.serverSideError = {
				message: serverSideValidationResult?.result?.message ?? "",
				error: serverSideValidationResult?.result?.error ?? "",
				line: line,
				path: serverSideValidationPath,
			};
			serverSideValidationPath.length > 0 &&
				errorMarkers.push({
					startLineNumber: line ?? 0,
					endLineNumber: 0,
					startColumn: column ?? 0,
					endColumn: column ?? 0,
					severity: 8,
					message: serverSideValidationResult?.result?.message + " - " + serverSideValidationResult?.result?.error,
				});
		}
		model && monacoRef?.current?.editor.setModelMarkers(model, "json", errorMarkers);
	}
	return totalErrors;
}

export function customValidate(
	mainItemsData: IValidateItem,
	serviceItemsData: IValidateItem | undefined,
	errorMarkers: editor.IMarkerData[],
	totalErrors: IError,
	configData: string,
	isServerSideValidationEnabled?: boolean
) {
	if (!mainItemsData) return totalErrors;
	for (const key of Object.keys(mainItemsData)) {
		const mainItems = mainItemsData[key];
		const serviceItems = serviceItemsData?.[key];

		if (!serviceItems) continue;
		serviceItems.forEach((item) => {
			if (
				!mainItems?.some((mainItem) => mainItem.source === item.source) &&
				!mainItemsData["connectors"]?.some((mainItem) => mainItem.source === item.source)
			) {
				const errorMessage = `${capitalize(key)} "${item.source}" is not defined.`;
				const { line, column } = findLineAndColumn(configData, item.offset);
				const endColumn = column + (item.source?.length ?? 0);

				const errorMarker = {
					startLineNumber: line || 0,
					endLineNumber: 0,
					startColumn: column || 0,
					endColumn: endColumn,
					severity: 8,
					message: errorMessage,
				};
				errorMarkers.push(errorMarker);
				totalErrors.customErrors?.push(errorMarker.message + " " + `(Line ${line})`);
			}
		});

		if (!isServerSideValidationEnabled) {
			mainItems?.forEach((item) => {
				if (!serviceItems.some((serviceItem) => serviceItem.source === item.source)) {
					const errorMessage = `${capitalize(key)} "${item.source}" is unused.`;
					const { line, column } = findLineAndColumn(configData, item.offset);
					const endColumn = column + (item.source?.length ?? 0);

					const errorMarker = {
						startLineNumber: line ?? 0,
						endLineNumber: 0,
						startColumn: column ?? 0,
						endColumn: endColumn,
						severity: 4,
						message: errorMessage,
					};
					errorMarkers.push(errorMarker);

					totalErrors.customWarnings?.push(errorMarker.message + " " + `(Line ${line})`);
				}
			});
		}
	}
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

export const findErrorElement = (path: string[], data?: IYamlElement[]): IYamlElement | undefined => {
	if (!path.length || !data) {
		return undefined;
	}

	const [head, ...tail] = path;

	for (const item of data) {
		if (item.key === head) {
			if (tail.length === 0 || !Array.isArray(item.value)) {
				return item;
			}

			return findErrorElement(tail, item.value);
		}
	}
	return undefined;
};
