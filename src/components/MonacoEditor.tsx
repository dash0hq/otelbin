import { useRef, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Button } from './ui/button';
import { useConfigs, useInsertConfigs } from '~/queries/config';
import { Input } from "./ui/input"


export default function MonacoEditor() {
    const [data, setData] = useState({ name: '', config: '' })
    // const [name, setName] = useState<string | undefined>('');
    // const [config, setConfig] = useState<string | undefined>('');
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

    function handleDownload() {

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

    function handleChangeInput(e: React.ChangeEvent<HTMLInputElement>) {
        setData({ name: e.target.value, config: data.config })
    }

    function handleEditorDidMount(editor: any, monaco: any) {
        editorRef.current = editor;
    }

    const { data: configs, isLoading, isError } = useConfigs()
    const mutation = useInsertConfigs()


    const submitData = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const result = await mutation.mutateAsync(data);
            setData({ name: '', config: '' })
        } catch (err: any) {

        }

    }

    return (
        <div className="flex gap-x-4">
            <Editor
                value={data.config}
                onMount={handleEditorDidMount}
                height="100vh"
                width={'50%'}
                defaultLanguage="yaml"
                theme="vs-dark"
                options={{ automaticLayout: true }}
                onChange={(value, event) => {
                    setData({ name: data.name, config: value || '' })
                }}
            />
            <div className='flex flex-col gap-y-4'>
                <div className='flex flex-col gap-y-4 w-56'>
                    <Button onClick={handleCopy}>Copy</Button>
                    <Button onClick={handleDownload}>Download</Button>
                    <Button onClick={submitData}>Save to database</Button>
                    <Input
                        value={data.name}
                        onChange={handleChangeInput} placeholder="config name" />
                </div>
                <div className='flex flex-wrap'>
                    {configs && configs?.length > 0 && configs.map((config) => {
                        return <Button onClick={() => {
                            config &&
                                setData({ name: config.name, config: config.config })
                        }} key={config.id} variant={'outline'}>{config.name}</Button>
                    })}
                </div>
            </div>
        </div>
    );
}

