import React, { createContext, useRef, useState } from "react";
import type { RefObject } from "react";
import type { editor } from "monaco-editor";

type EditorRefType = RefObject<editor.IStandaloneCodeEditor | null>;
type MonacoRefType = RefObject<any | null>;

export const EditorContext = createContext<EditorRefType | null>(null);
export const MonacoContext = createContext<MonacoRefType | null>(null);
export const EditorDidMount = createContext<any | null>(null);
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
    const monacoRef = useRef<any>(null);
    const [monacoInstance, setMonacoInstance] =
        React.useState<editor.IStandaloneCodeEditor | null>(null);

    function editorDidMount(editor: editor.IStandaloneCodeEditor, monaco: any) {
        editorRef.current = editor;
        monacoRef.current = monaco;
        setMonacoInstance(editor);
        monacoRef.current.languages.setLanguageConfiguration("yaml", {
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
                    <FocusContext.Provider value={focusContext}>
                        {children}
                    </FocusContext.Provider>
                </MonacoContext.Provider>
            </EditorContext.Provider>
        </EditorDidMount.Provider>
    );
};
