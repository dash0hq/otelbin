// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import React, { createContext, useRef, useState } from "react";
import type { RefObject } from "react";
import { type editor } from "monaco-editor";
import { loader, type Monaco, type OnMount } from "@monaco-editor/react";
import { configureMonacoYaml, type SchemasSettings } from "monaco-yaml";
import schema from "../components/monaco-editor/schema.json";
import { fromPosition, toCompletionList } from "monaco-languageserver-types";
import { type languages } from "monaco-editor/esm/vs/editor/editor.api.js";

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

export const EditorProvider = ({ children }: { children: any }) => {
	const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
	const monacoRef = useRef<Monaco | null>(null);
	const monacoYamlRef = useRef<any | null>(null);
	const [focused, setFocused] = useState("");
	const [viewMode, setViewMode] = useState("both");

	function editorDidMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
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

		editorRef.current = editor;
		monacoRef.current = monaco;
		monacoRef?.current?.languages.setLanguageConfiguration("yaml", {
			wordPattern: /\w+\/\w+|\w+/,
		});

		monacoYamlRef.current = configureMonacoYaml(monaco, {
			enableSchemaRequest: true,
			schemas: [defaultSchema],
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

	if (typeof window !== "undefined") {
		loader.init().then((monaco) => {
			monaco.editor.defineTheme("OTelBin", {
				base: "vs-dark",
				inherit: true,
				rules: [
					{ token: "", fontStyle: "" },
					{ token: "comment", foreground: "#6D737D" },
					{ token: "string.yaml", foreground: "#38BDF8" },
					{ token: "number.yaml", foreground: "#38BDF8" },
					{ token: "keyword.operator.assignment", foreground: "#38BDF8" },
				],
				colors: {
					"editor.background": "#151721",
					"editorLineNumber.foreground": "#6D737D",
					"editorLineNumber.activeForeground": "#F9FAFB",
					"editorCursor.foreground": "#F9FAFB",
					"editor.selectionBackground": "#30353D",
					"editor.selectionHighlightBackground": "#30353D",
					"editor.hoverHighlightBackground": "#30353D",
					"editor.lineHighlightBackground": "#30353D",
					"editor.lineHighlightBorder": "#30353D",
				},
			});
		});
	}

	return (
		<EditorDidMount.Provider value={editorDidMount}>
			<EditorContext.Provider value={editorRef}>
				<MonacoContext.Provider value={monacoRef}>
					<FocusContext.Provider value={focusContext}>
						<ViewModeContext.Provider value={viewModeContext}>{children}</ViewModeContext.Provider>
					</FocusContext.Provider>
				</MonacoContext.Provider>
			</EditorContext.Provider>
		</EditorDidMount.Provider>
	);
};
