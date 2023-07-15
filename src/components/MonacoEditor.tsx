import { useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from './ui/button';
import { useConfigs } from '~/queries/config';


export default function MonacoEditor() {
    const name = 'test'
    const [config, setConfig] = useState<string | undefined>('');
    const editorRef = useRef<any>(null);

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

    function handleEditorDidMount(editor: any, monaco: any) {
        editorRef.current = editor;
    }

    const { data, isLoading, isError } = useConfigs()

    const submitData = async (e: any) => {
        e.preventDefault()
        try {
            const body = { name, config }
            await fetch(`/api/config`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            })
            setConfig('')
            editorRef.current.setValue('')
            // await Router.push('/')
        } catch (error) {
            console.error(error)
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
                onChange={(value, event) => {
                    setConfig(value)
                }}
            />
            <div className='flex flex-col gap-y-4'>
                <Button onClick={handleCopy}>Copy</Button>
                <Button onClick={handleSave}>Save</Button>
                <Button onClick={submitData}>Save to database</Button>
                <Button >Load from database</Button>
            </div>
        </div>
    );
}

// export const getServerSideProps: GetServerSideProps = async () => {
//     const data = await prisma.otelColConfig.findMany()
//     return {
//         props: { data },
//     }
// }

