// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { schema } from "./JSONSchema";
import type { IAjvError, IError } from "./ErrorConsole";
import JsYaml from "js-yaml";
import Ajv from "ajv";
import type { ErrorObject } from "ajv";
import type { RefObject } from "react";
import type { editor } from "monaco-editor";

type EditorRefType = RefObject<editor.IStandaloneCodeEditor | null>;
type MonacoRefType = RefObject<any | null>;

export function validateOtelCollectorConfigurationAndSetMarkers(
	configData: string,
	editorRef: EditorRefType | null,
	monacoRef: MonacoRefType | null
) {
	const ajv = new Ajv({ allErrors: true });
	const model = editorRef?.current?.getModel();
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

		monacoRef?.current?.editor.setModelMarkers(model, "json", []);
	} catch (error: any) {
		const errorLineNumber = error.mark.line;
		const errorColumn = error.mark.column;
		const errorMessage = error.reason;
		const errorMarker = {
			startLineNumber: errorLineNumber,
			endLineNumber: errorLineNumber,
			startColumn: errorColumn,
			endColumn: errorColumn,
			severity: monacoRef?.current?.MarkerSeverity.Error,
			message: errorMessage,
		};
		monacoRef?.current?.editor.setModelMarkers(model, "json", [errorMarker]);

		totalErrors.jsYamlError = error;
	}

	return totalErrors;
}
