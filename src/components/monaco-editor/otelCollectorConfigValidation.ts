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
type EditorRefType = RefObject<editor.IStandaloneCodeEditor | null>;
type MonacoRefType = RefObject<Monaco | null>;

export function validateOtelCollectorConfigurationAndSetMarkers(
	configData: string,
	editorRef: EditorRefType,
	monacoRef: MonacoRefType
) {
	const ajv = new Ajv({ allErrors: true });
	const model = editorRef.current?.getModel();
	const ajvError: IAjvError[] = [];
	const totalErrors: IError = { ajvErrors: ajvError };
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

		model && monacoRef?.current?.editor.setModelMarkers(model, "json", []);
	} catch (error: unknown) {
		const knownError = error as IJsYamlError;
		const errorLineNumber = knownError.mark.line;
		// const errorColumn = knownError.mark;
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
