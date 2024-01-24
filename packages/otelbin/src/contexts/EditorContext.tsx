// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import React, { createContext, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode, RefObject } from "react";
import { type editor, type IPosition } from "monaco-editor";
import { type Monaco, type OnMount } from "@monaco-editor/react";
import { configureMonacoYaml, type MonacoYamlOptions, type SchemasSettings } from "monaco-yaml";
import schema from "../components/monaco-editor/schema.json";
import { fromPosition, toCompletionList } from "monaco-languageserver-types";
import { type languages } from "monaco-editor/esm/vs/editor/editor.api.js";
import type { IItem } from "../components/monaco-editor/parseYaml";
import { extractVariables, getYamlDocument, selectConfigType } from "../components/monaco-editor/parseYaml";
import { type WorkerGetter, createWorkerManager } from "monaco-worker-manager";
import { type CompletionList, type Position } from "vscode-languageserver-types";
import { validateOtelCollectorConfigurationAndSetMarkers } from "~/components/monaco-editor/otelCollectorConfigValidation";
import "../components/react-flow/decorationStyles.css";

export interface ILine {
	lines: number[];
}

export interface IEnvVar {
	name: string;
	submittedValue?: string;
	defaultValues?: string[];
	lines?: ILine;
	bounded?: boolean;
}

interface YAMLWorker {
	doComplete: (uri: string, position: Position) => CompletionList | undefined;
}
type EditorRefType = RefObject<editor.IStandaloneCodeEditor | null>;
type MonacoRefType = RefObject<Monaco | null>;
export type WorkerAccessor = WorkerGetter<YAMLWorker>;

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

export type ViewMode = "both" | "code" | "pipeline";

export const ViewModeContext = createContext<{
	viewMode: ViewMode;
	setViewMode: (viewMode: ViewMode) => void;
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

export const EnvVarMenuContext = createContext<{
	openEnvVarMenu: boolean;
	setOpenEnvVarMenu: (openEnvVarMenu: boolean) => void;
}>({
	openEnvVarMenu: false,
	setOpenEnvVarMenu: () => {
		return;
	},
});

export const EnvVarLine = createContext<{
	envVarLine: Record<string, ILine>;
	setEnvVarLine: (envVarLine: Record<string, ILine>) => void;
}>({
	envVarLine: {},
	setEnvVarLine: () => {
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

export function useEnvVarMenu() {
	return React.useContext(EnvVarMenuContext);
}

export function useEnvLines() {
	return React.useContext(EnvVarLine);
}

export const EditorProvider = ({ children }: { children: ReactNode }) => {
	const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
	const [editorRefState, setEditorRefState] = useState<editor.IStandaloneCodeEditor>();
	const monacoRef = useRef<Monaco | null>(null);
	const monacoYamlRef = useRef<unknown | null>(null);
	const [focused, setFocused] = useState("");
	const [viewMode, setViewMode] = useState<ViewMode>("both");
	const [path, setPath] = useState("");
	const [openEnvVarMenu, setOpenEnvVarMenu] = useState(true);
	const currentValue = editorRefState?.getModel()?.getValue() ?? "";
	const variables = useMemo(() => extractVariables(currentValue), [currentValue]);
	const [envVarLine, setEnvVarLine] = useState<Record<string, ILine>>({});

	function extractLineNumbers(envVars: string[]) {
		const envVarLines: Record<string, ILine> = {};

		if (envVars && envVars.length > 0 && editorRefState) {
			const envVarPlaceHolder = envVars.map((variable) => variable.slice(2, -1));

			envVarPlaceHolder.forEach((variable) => {
				const name = variable.split(":")[0] ?? variable;
				const matchCondition = name === variable ? "${" + name + "}" : "${" + name + ":";
				const matches =
					editorRef?.current?.getModel()?.findMatches(matchCondition, true, false, false, null, false) ?? [];

				envVarLines[name] = {
					lines: matches.map((match) => match.range.startLineNumber),
				};
			});
		}

		return envVarLines;
	}

	function envVarDecoration(variables: string[]) {
		if (variables.length === 0) return;
		if (editorRefState) {
			variables.forEach((variable) => {
				const findMatches = editorRef.current?.getModel()?.findMatches(variable, true, false, false, null, false);

				if (findMatches) {
					findMatches.forEach((match) => {
						const range = match.range;
						const startLineNumber = range.startLineNumber;
						const startColumn = range.startColumn;
						const endLineNumber = range.endLineNumber;
						const endColumn = range.endColumn;
						const decoration = {
							range: {
								startLineNumber: startLineNumber,
								startColumn: startColumn,
								endLineNumber: endLineNumber,
								endColumn: endColumn,
							},
							options: {
								isWholeLine: false,
								className: "envVarDecoration",
								inlineClassName: "envVarDecoration",
								stickiness: monacoRef.current?.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
							},
						};
						editorRef?.current?.createDecorationsCollection([decoration]);
					});
				}
			});
		}
	}

	useEffect(() => {
		envVarDecoration(variables);
		setEnvVarLine(extractLineNumbers(variables));
	}, [variables]);

	function editorDidMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
		editorRef.current = editor;
		setEditorRefState(editor);

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

		validateOtelCollectorConfigurationAndSetMarkers(
			editorRef.current.getModel()?.getValue() || "",
			editorRef,
			monacoRef
		);

		monacoRef?.current?.languages.setLanguageConfiguration("yaml", {
			wordPattern: /\${([^}]+:[^}]+)}|\${([^}]+)}|(?:\w+\/[\w_]+(?:-[\w_]+)*|\w+)/,
		});

		const createData: MonacoYamlOptions = {
			enableSchemaRequest: true,
			schemas: [defaultSchema],
			validate: true,
		};

		monacoYamlRef.current = configureMonacoYaml(monaco, createData);

		const worker = createWorkerManager<YAMLWorker, MonacoYamlOptions>(monaco, {
			label: "yaml",
			moduleId: "monaco-yaml/yaml.worker",
			createData,
		});

		function createCompletionItemProvider(getWorker: WorkerAccessor): languages.CompletionItemProvider {
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
			createCompletionItemProvider(worker.getWorker)
		);

		let value = editorRef.current?.getValue() ?? "";
		let docElements = getYamlDocument(value);
		editorRef.current?.onDidChangeModelContent(() => {
			value = editorRef.current?.getValue() ?? "";
			docElements = getYamlDocument(value);
		});

		function correctKey(value: string, key?: string, key2?: string) {
			if (key2 != undefined) value += " > " + key2;
			if (key != undefined) value += " > " + key;
			return value;
		}

		function findSymbols(yamlItems: IItem[], currentPath: string, searchFilter: string, cursorOffset: number) {
			if (yamlItems.length === 0) return;
			else if (Array.isArray(yamlItems)) {
				for (const item of yamlItems) {
					if (item?.key && item.key.source.includes(searchFilter)) {
						const keyOffset = item.key.offset;
						const keyLength = item.key.source.length;
						const sepNewLineOffset = item?.sep[1]?.offset ? item.sep[1].offset : keyLength + keyOffset;

						if (cursorOffset >= keyOffset && cursorOffset <= sepNewLineOffset) {
							setTimeout(() => {
								setPath(correctKey(currentPath, item.key.source));
							}, 10);
							return;
						}
					}
					if (item?.value) {
						if (item?.value?.source?.includes(searchFilter)) {
							const valueOffset = item.value.offset;
							const valueLength = item.value.source.length;
							const valueEndOffset =
								item?.value?.end?.length && item.value.end?.[0]?.offset
									? item.value.end?.[0].offset
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

		editorRef.current.onMouseDown(() => {
			const envVarRegex = /\${([^}]+)}/g;
			const cursorOffset = editorRef?.current?.getPosition() as IPosition;
			const wordAtCursor: editor.IWordAtPosition = editorRef?.current?.getModel()?.getWordAtPosition(cursorOffset) || {
				word: "",
				startColumn: 0,
				endColumn: 0,
			};

			if (wordAtCursor.word.match(envVarRegex)) {
				setOpenEnvVarMenu(true);
			}
		});

		envVarDecoration(variables);

		editorRef.current.onDidChangeCursorPosition((e) => {
			const cursorOffset = editorRef?.current?.getModel()?.getOffsetAt(e.position) ?? 0;
			const wordAtCursor: editor.IWordAtPosition = editorRef?.current?.getModel()?.getWordAtPosition(e.position) || {
				word: "",
				startColumn: 0,
				endColumn: 0,
			};
			findSymbols(docElements, "", wordAtCursor.word, cursorOffset);
			envVarDecoration(variables);
		});

		editorRef.current.onDidPaste(() => {
			const currentConfig = editorRef.current?.getModel()?.getValue() || "";
			const configType = selectConfigType(currentConfig);
			if (configType !== currentConfig) {
				editorRef.current?.getModel()?.setValue((configType as string) ?? "");
			}
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

	const envVarMenuContext = {
		openEnvVarMenu: openEnvVarMenu,
		setOpenEnvVarMenu: setOpenEnvVarMenu,
	};

	const envVarLineContext = {
		envVarLine: envVarLine,
		setEnvVarLine: setEnvVarLine,
	};

	return (
		<EditorDidMount.Provider value={editorDidMount}>
			<EditorContext.Provider value={editorRef}>
				<MonacoContext.Provider value={monacoRef}>
					<FocusContext.Provider value={focusContext}>
						<ViewModeContext.Provider value={viewModeContext}>
							<BreadcrumbsContext.Provider value={breadcrumbsContext}>
								<EnvVarMenuContext.Provider value={envVarMenuContext}>
									<EnvVarLine.Provider value={envVarLineContext}>{children}</EnvVarLine.Provider>
								</EnvVarMenuContext.Provider>
							</BreadcrumbsContext.Provider>
						</ViewModeContext.Provider>
					</FocusContext.Provider>
				</MonacoContext.Provider>
			</EditorContext.Provider>
		</EditorDidMount.Provider>
	);
};
