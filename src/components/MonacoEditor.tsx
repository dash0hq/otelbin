import { useRef } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from './ui/button';
import Link from 'next/link';

export default function MonacoEditor() {

    const editorRef = useRef<any>(null);

    function handleEditorDidMount(editor: any, monaco: any) {
        editorRef.current = editor;
    }

    function handleCopy() {

        const selection = editorRef.current.getSelection();
        if (selection.isEmpty()) {
            const allText = editorRef.current.getValue();
            navigator.clipboard.writeText(allText);
        } else {
            const selectedText = editorRef.current.getModel().getValueInRange(selection);
            navigator.clipboard.writeText(selectedText);
        }
    }

    function handleSave() {

        const allText = editorRef.current.getValue();

        if (allText.length > 0) {
            const blob = new Blob([allText], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.download = 'config.yaml';
            link.href = url;
            link.click();
        } else {
            alert('No text to save');
        }
    }

    return (
        <div className="flex gap-x-4">
            <Editor
                onMount={handleEditorDidMount}
                height="100vh"
                width={'50%'}
                defaultLanguage="yaml"
                defaultValue="hello world"
                theme="vs-dark"
                options={{ automaticLayout: true }}
            />
            <div className='flex flex-col gap-y-4'>
                <Button onClick={handleCopy}>Copy</Button>
                <Button onClick={handleSave}>Save</Button>
                <Link href="/react-flow">go to the flow</Link>
            </div>
        </div>
    );
}