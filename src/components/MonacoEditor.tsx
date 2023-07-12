import Editor from '@monaco-editor/react';

export default function MonacoEditor() {
    return (
        <Editor
            height="100vh"
            width={'50%'}
            defaultLanguage="yaml"
            defaultValue="hello world"
            theme="vs-dark"
            options={{ automaticLayout: true }}
        />
    );
}