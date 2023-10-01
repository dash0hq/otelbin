// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { initialize } from "monaco-worker-manager/worker";
import { type MonacoYamlOptions } from "monaco-yaml";
import { TextDocument } from "vscode-languageserver-textdocument";
import {
	type CodeAction,
	type CodeActionContext,
	type CompletionList,
	type Diagnostic,
	type DocumentLink,
	type DocumentSymbol,
	type FoldingRange,
	type Hover,
	type LocationLink,
	type Position,
	type Range,
	type TextEdit,
} from "vscode-languageserver-types";
import { type Telemetry } from "yaml-language-server/lib/esm/languageservice/telemetry.js";
import {
	getLanguageService,
	type WorkspaceContextService,
} from "yaml-language-server/lib/esm/languageservice/yamlLanguageService.js";

async function schemaRequestService(uri: string): Promise<string> {
	const response = await fetch(uri);
	if (response.ok) {
		return response.text();
	}
	throw new Error(`Schema request failed for ${uri}`);
}

export interface YAMLWorker {
	doValidation: (uri: string) => Diagnostic[] | undefined;

	doComplete: (uri: string, position: Position) => CompletionList | undefined;

	doDefinition: (uri: string, position: Position) => LocationLink[] | undefined;

	doHover: (uri: string, position: Position) => Hover | null | undefined;

	format: (uri: string) => TextEdit[] | undefined;

	resetSchema: (uri: string) => boolean;

	findDocumentSymbols: (uri: string) => DocumentSymbol[] | undefined;

	findLinks: (uri: string) => DocumentLink[] | undefined;

	getCodeAction: (uri: string, range: Range, context: CodeActionContext) => CodeAction[] | undefined;

	getFoldingRanges: (uri: string) => FoldingRange[] | null | undefined;
}

const telemetry: Telemetry = {
	send() {
		// Do nothing
	},
	sendError(name, properties) {
		// eslint-disable-next-line no-console
		console.error("monaco-yaml", name, properties);
	},
	sendTrack() {
		// Do nothing
	},
};

const workspaceContext: WorkspaceContextService = {
	resolveRelativePath(relativePath, resource) {
		return String(new URL(relativePath, resource));
	},
};

initialize<YAMLWorker, MonacoYamlOptions>((ctx, { enableSchemaRequest, ...languageSettings }) => {
	const ls = getLanguageService({
		// @ts-expect-error Type definitions are wrong. This may be null.
		schemaRequestService: enableSchemaRequest ? schemaRequestService : null,
		telemetry,
		workspaceContext,
	});

	const withDocument =
		<A extends unknown[], R>(fn: (document: TextDocument, ...args: A) => R) =>
		(uri: string, ...args: A) => {
			const models = ctx.getMirrorModels();
			for (const model of models) {
				if (String(model.uri) === uri) {
					return fn(TextDocument.create(uri, "yaml", model.version, model.getValue()), ...args);
				}
			}
		};

	ls.configure(languageSettings);

	return {
		doValidation: withDocument((document) => ls.doValidation(document, Boolean(languageSettings.isKubernetes))),

		doComplete: withDocument((document, position) =>
			ls.doComplete(document, position, Boolean(languageSettings.isKubernetes))
		),

		doDefinition: withDocument((document, position) => ls.doDefinition(document, { position, textDocument: document })),

		doHover: withDocument((document, position) => ls.doHover(document, position)),

		format: withDocument((document) => ls.doFormat(document, {})),

		resetSchema: (uri) => ls.resetSchema(uri),

		findDocumentSymbols: withDocument((document) => ls.findDocumentSymbols2(document, {})),

		findLinks: withDocument((document) => ls.findLinks(document)),

		getCodeAction: withDocument((document, range, context) =>
			ls.getCodeAction(document, { range, textDocument: document, context })
		),

		getFoldingRanges: withDocument((document) => ls.getFoldingRanges(document, { lineFoldingOnly: true })),
	};
});
