import React, { createContext, useRef, RefObject } from "react";
import { editor } from "monaco-editor"; // Import Monaco editor API

type EditorRefType = RefObject<editor.IStandaloneCodeEditor | null>;

export const EditorContext = createContext<EditorRefType | null>(null);
export const MonacoContext = createContext<any | null>(null);
export const EditorDidMount = createContext<any | null>(null);

export function useEditorRef() {
    return React.useContext(EditorContext);
}

export function useMonacoRef() {
    return React.useContext(MonacoContext);
}

export function useEditorDidMount() {
    return React.useContext(EditorDidMount);
}

export const EditorProvider = ({ children }: { children: any }) => {
    const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
    const monacoRef = useRef<any>(null);
    const [monacoInstance, setMonacoInstance] = React.useState<editor.IStandaloneCodeEditor | null>(null);

    function editorDidMount(editor: editor.IStandaloneCodeEditor, monaco: any) {
        editorRef.current = editor;
        monacoRef.current = monaco;
        setMonacoInstance(editor);
        monacoRef.current.languages.setLanguageConfiguration('yaml', { wordPattern: /\w+\/\w+|\w+/ });
    }

    return (
        <EditorDidMount.Provider value={editorDidMount}>
            <EditorContext.Provider value={editorRef}>
                <MonacoContext.Provider value={monacoRef}>
                    {children}
                </MonacoContext.Provider>
            </EditorContext.Provider>
        </EditorDidMount.Provider>
    );
};

