// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import React, { createContext, useCallback, useRef, useState } from "react";
import type { RefObject } from "react";
import { type editor } from "monaco-editor";
import { type Monaco, type OnMount } from "@monaco-editor/react";
import { configureMonacoYaml, type SchemasSettings } from "monaco-yaml";
import schema from "../components/monaco-editor/schema.json";
import { fromPosition, toCompletionList } from "monaco-languageserver-types";
import { type languages } from "monaco-editor/esm/vs/editor/editor.api.js";
import { Parser } from "yaml";
import type { Document, IItem } from "../components/monaco-editor/yamlParserTypes";

type EditorRefType = RefObject<editor.IStandaloneCodeEditor | null>;
type MonacoRefType = RefObject<Monaco | null>;

export const EditorContext = createContext<EditorRefType | null>(null);
export const MonacoContext = createContext<MonacoRefType | null>(null);
export const EditorDidMount = createContext<OnMount | undefined>(undefined);

export const FocusContext = createContext<{
	setFocused: (focus: string) => void;
	isFocused: string;
}>({
	setFocused: () => {
		return;
	},
	isFocused: "",
});

export const ViewModeContext = createContext<{
	viewMode: string;
	setViewMode: (viewMode: string) => void;
}>({
	viewMode: "both",
	setViewMode: () => {
		return;
	},
});

export const BreadcrumbsContext = createContext<{
	path: string;
	setPath: (path: string) => void;
}>({
	path: "",
	setPath: () => {
		return;
	},
});

export function useEditorRef() {
	return React.useContext(EditorContext);
}

export function useMonacoRef() {
	return React.useContext(MonacoContext);
}

export function useEditorDidMount() {
	return React.useContext(EditorDidMount);
}

export function useFocus() {
	return React.useContext(FocusContext);
}

export function useViewMode() {
	return React.useContext(ViewModeContext);
}

export function useBreadcrumbs() {
	return React.useContext(BreadcrumbsContext);
}

export const EditorProvider = ({ children }: { children: any }) => {
	const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
	const monacoRef = useRef<Monaco | null>(null);
	const monacoYamlRef = useRef<unknown | null>(null);
	const [focused, setFocused] = useState("");
	const [viewMode, setViewMode] = useState("both");
	const [path, setPath] = useState("");

	const getValue = useCallback((editorValue: string) => {
		const value = editorValue;
		const parsedYaml = Array.from(new Parser().parse(value));
		const doc = parsedYaml.find((token) => token.type === "document") as Document;
		const docObject: IItem[] = doc?.value?.items ?? [];
		return docObject;
	}, []);

	function editorDidMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
		editorRef.current = editor;

		window.MonacoEnvironment = {
			getWorker(_, label) {
				switch (label) {
					case "editorWorkerService":
						return new Worker(new URL("monaco-editor/esm/vs/editor/editor.worker", import.meta.url));
					case "yaml":
						return new Worker(new URL("monaco-yaml/yaml.worker", import.meta.url));
					default:
						throw new Error(`Unknown label ${label}`);
				}
			},
		};

		const defaultSchema: SchemasSettings = {
			uri: "https://github.com/dash0hq/otelbin/blob/main/src/components/monaco-editor/schema.json",
			// @ts-expect-error TypeScript can’t narrow down the type of JSON imports
			schema,
			fileMatch: ["*"],
		};

		monacoRef.current = monaco;
		monacoRef?.current?.languages.setLanguageConfiguration("yaml", {
			wordPattern: /\w+\/\w+|\w+/,
		});

		monacoYamlRef.current = configureMonacoYaml(monaco, {
			enableSchemaRequest: true,
			schemas: [defaultSchema],
		});

		let value = editorRef.current?.getValue() ?? "";
		let docObject = getValue(value);
		editorRef.current?.onDidChangeModelContent(() => {
			value = editorRef.current?.getValue() ?? "";
			docObject = getValue(value);
		});

		function correctKey(value: string, key?: string, key2?: string) {
			if (key2 != undefined) value += " > " + key2;
			if (key != undefined) value += " > " + key;
			return value;
		}

		function findSymbols(yamlItems: IItem[], currentPath: string, searchFilter: string, cursorOffset: number) {
			if (yamlItems.length === 0) return;
			else if (Array.isArray(yamlItems)) {
				for (let i = 0; i < yamlItems.length; i++) {
					const item = yamlItems[i];

					if (item?.key && item.key.source.includes(searchFilter)) {
						const keyOffset = item.key.offset;
						const keyLength = item.key.source.length;
						const sepNewLineOffset = item?.sep[1]?.offset ? item.sep[1].offset : keyLength + keyOffset;

						if (cursorOffset >= keyOffset && cursorOffset <= sepNewLineOffset) {
							setTimeout(() => {
								setPath(correctKey(currentPath, item.key.source) as string);
							}, 10);
							return;
						}
					}
					if (item?.value) {
						if (item.value.source && item.value.source.includes(searchFilter)) {
							const valueOffset = item.value.offset;
							const valueLength = item.value.source.length;
							const valueEndOffset =
								item.value.end && item.value.end.length > 0 && item.value.end[0] && item.value.end[0].offset
									? item.value.end[0].offset
									: valueLength + valueOffset;

							if (cursorOffset >= valueOffset && cursorOffset <= valueEndOffset) {
								setTimeout(() => {
									setPath(correctKey(currentPath, item.value.source, item.key ? item.key.source : undefined));
								}, 10);
								return;
							}
						}
						if (Array.isArray(item.value.items)) {
							if (item.key) {
								findSymbols(
									item.value.items,
									correctKey(currentPath, item.value.source, item.key.source),
									searchFilter,
									cursorOffset
								);
							} else {
								findSymbols(item.value.items, correctKey(currentPath, item.value.source), searchFilter, cursorOffset);
							}
						}
					}
				}
			}
			if (searchFilter === "") {
				setPath("");
			}
		}

		editorRef.current.onDidChangeCursorPosition((e) => {
			const cursorOffset = editorRef?.current?.getModel()?.getOffsetAt(e.position) || 0;
			const wordAtCursor: editor.IWordAtPosition = editorRef?.current?.getModel()?.getWordAtPosition(e.position) || {
				word: "",
				startColumn: 0,
				endColumn: 0,
			};
			findSymbols(docObject, "", wordAtCursor.word, cursorOffset);
		});
	}

	const focusContext = {
		setFocused: setFocused,
		isFocused: focused,
	};

	const viewModeContext = {
		setViewMode: setViewMode,
		viewMode: viewMode,
	};

	const breadcrumbsContext = {
		setPath: setPath,
		path: path,
	};

	function createCompletionItemProvider(getWorker: any): languages.CompletionItemProvider {
		return {
			triggerCharacters: [" ", ":"],

			async provideCompletionItems(model, position) {
				const resource = model.uri;

				const worker = await getWorker(resource);
				const info = await worker.doComplete(String(resource), fromPosition(position));
				if (!info) {
					return;
				}

				const wordInfo = model.getWordUntilPosition(position);

				return toCompletionList(info, {
					range: {
						startLineNumber: position.lineNumber,
						startColumn: wordInfo.startColumn,
						endLineNumber: position.lineNumber,
						endColumn: wordInfo.endColumn,
					},
				});
			},
		};
	}

	monacoRef?.current?.languages.registerCompletionItemProvider(
		"yaml",
		createCompletionItemProvider(new Worker(new URL("monaco-yaml/yaml.worker", import.meta.url)))
	);

	return (
		<EditorDidMount.Provider value={editorDidMount}>
			<EditorContext.Provider value={editorRef}>
				<MonacoContext.Provider value={monacoRef}>
					<FocusContext.Provider value={focusContext}>
						<ViewModeContext.Provider value={viewModeContext}>
							<BreadcrumbsContext.Provider value={breadcrumbsContext}>{children}</BreadcrumbsContext.Provider>
						</ViewModeContext.Provider>
					</FocusContext.Provider>
				</MonacoContext.Provider>
			</EditorContext.Provider>
		</EditorDidMount.Provider>
	);
};
