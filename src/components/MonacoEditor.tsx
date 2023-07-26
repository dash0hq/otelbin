//React & Next
import { useRef, useState } from 'react';
import Router from 'next/router';
//Queries and scripts
import { IConfig, useConfigs, useInsertConfigs } from '~/queries/config';
//Internal components
import DeleteConfigButton from './DeleteConfigButton';
//External libraries
import Editor from '@monaco-editor/react';
//UI
import { Button } from './ui/button';
import { Input } from "./ui/input"
import { ReactFlowProvider } from 'reactflow';
import Flow from './react-flow/ReactFlowCom';




export default function MonacoEditor({ id }: { id?: string }) {
    const editorRef = useRef<any>(null);
    const [clicked, setClicked] = useState(false)
    const [data, setData] = useState({ name: '', config: '' })
    const { data: configs } = useConfigs()
    const mutation = useInsertConfigs()


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

    const submitData = async (e: React.FormEvent) => {
        e.preventDefault()
        if (data.name === '' || data.config === '') {
            alert('Please fill all fields')
            return
        }
        try {
            const result = await mutation.mutateAsync(data);
            setData({ name: '', config: '' })
        } catch (err: any) {

        }
        setClicked(false)
    }

    return (
        <div className="flex gap-x-4">
            <Editor
                value={
                    !clicked ?
                        configs && configs?.length > 0 &&
                        configs.filter((config: IConfig) => config.id?.toString() === id)[0]?.config || data.config
                        : data.config
                }
                onMount={handleEditorDidMount}
                height="100vh"
                width={'50%'}
                defaultLanguage="yaml"
                theme="vs-dark"
                options={{ automaticLayout: true }}
                onChange={
                    (value, event) => {
                        setData({
                            name: data.name,
                            config: value || ''
                        })
                    }}
            />
             <div className='flex flex-col gap-y-4 '>
            <ReactFlowProvider>
                <Flow value={data.config}/>
            </ReactFlowProvider>
            </div>
        </div>
    );
}