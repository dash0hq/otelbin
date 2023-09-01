import React, { createContext, useRef, useState } from "react";
import type { RefObject } from "react";
import type { editor } from "monaco-editor";
import { type Monaco, type OnMount } from "@monaco-editor/react";

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

export const EditorProvider = ({ children }: { children: any }) => {
	const [focused, setFocused] = useState("");
	const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
	const monacoRef = useRef<Monaco | null>(null);

	function editorDidMount(editor: editor.IStandaloneCodeEditor, monaco: Monaco) {
		editorRef.current = editor;
		monacoRef.current = monaco;
		monacoRef?.current?.languages.setLanguageConfiguration("yaml", {
			wordPattern: /\w+\/\w+|\w+/,
		});
	}

	const focusContext = {
		setFocused: setFocused,
		isFocused: focused,
	};

	return (
		<EditorDidMount.Provider value={editorDidMount}>
			<EditorContext.Provider value={editorRef}>
				<MonacoContext.Provider value={monacoRef}>
					<FocusContext.Provider value={focusContext}>{children}</FocusContext.Provider>
				</MonacoContext.Provider>
			</EditorContext.Provider>
		</EditorDidMount.Provider>
	);
};
