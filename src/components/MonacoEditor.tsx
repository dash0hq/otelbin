//React & Next
import { useRef, useState } from 'react';
import Router from 'next/router';
//Queries and scripts
import { useConfigs, useInsertConfigs } from '~/queries/config';
//Internal components
import DeleteConfigButton from './DeleteConfigButton';
import { schema } from './JSONSchema';
import ErrorConsole, { IAjvError, IError } from './ErrorConsole';
//External libraries
import Editor from '@monaco-editor/react';
import JsYaml from 'js-yaml';
import Ajv from "ajv"
//UI
import { Button } from './ui/button';
import { Input } from "./ui/input"

export default function MonacoEditor({ id }: { id?: string }) {
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const [clicked, setClicked] = useState(false)
    const [data, setData] = useState({ name: '', config: '' })
    const [errors, setErrors] = useState<IError>({});

    const { data: configs } = useConfigs()
    const mutation = useInsertConfigs()

    function handleEditorDidMount(editor: any, monaco: any) {
        editorRef.current = editor;
        monacoRef.current = monaco;
    }

    function handleEditorWillMount(editor: any) {
        editorRef.current = editor;
        editor.languages.json.jsonDefaults.setDiagnosticsOptions({
            validate: true,
            schemas: [
                schema
            ]
        });
    }

    function handleYamlValidation(configData?: any) {
        const ajv = new Ajv({ allErrors: true })
        let ajvError: IAjvError[] = []
        try {
            const jsonData = JsYaml.load(configData);
            const valid = ajv.validate(schema, jsonData);
            if (!valid) {

                const errors = ajv.errors;

                if (errors) {

                    const validationErrors = errors.map((error: any) => {

                        const errorInfo = {
                            line: null as number | null,
                            column: null as number | null,
                            message: error.message || 'Unknown error',
                        };

                        if (error instanceof JsYaml.YAMLException) {
                            errorInfo.line = error.mark.line + 1;
                            errorInfo.column = error.mark.column + 1;
                        }

                        return errorInfo;

                    });
                    ajvError.push(...validationErrors)
                }
            } else {
                ajvError = []
            }
            setErrors({ ...errors, ajvErrors: ajvError })

        } catch (error: any) {
            const model = editorRef.current.getModel();
            const errorLineNumber = error.mark.line;
            const errorColumn = error.mark.column;
            const errorMessage = error.reason;
            const errorMarker = {
                startLineNumber: errorLineNumber,
                endLineNumber: errorLineNumber,
                startColumn: errorColumn,
                endColumn: errorColumn,
                severity: monacoRef.current.MarkerSeverity.Error,
                message: errorMessage,
            };

            if (model) {
                monacoRef.current?.editor.setModelMarkers(model, "json", [errorMarker]);
            }
            setErrors({ ...errors, jsYamlError: error })
        }
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

    const submitData = async (e: React.FormEvent) => {
        e.preventDefault()
        if (data.name === '' || data.config === '') {
            alert('Please fill all fields')
            return
        }
        try {
            const result = await mutation.mutateAsync(data);
            setData({ name: '', config: '' })
        } catch (err: unknown) {

        }
        setClicked(false)
    }

    return (
        <div className="flex gap-x-4">
            <div className='relative w-[50%]'>
                <Editor
                    value={
                        !clicked ?
                            configs && configs?.length > 0 &&
                            configs.filter((config) => config.id?.toString() === id)[0]?.config || data.config
                            : data.config
                    }
                    beforeMount={handleEditorWillMount}
                    onMount={handleEditorDidMount}
                    height="100vh"
                    width={'100%'}
                    defaultLanguage='yaml'
                    theme="vs-dark"
                    options={{ automaticLayout: true }}
                    onChange={
                        (value) => {
                            setData({
                                name: data.name,
                                config: value || ''
                            })
                            handleYamlValidation(value ?? '')
                        }
                    }
                />
                <ErrorConsole errors={errors} />
            </div>

            <div className='flex w-full gap-x-4'>
                <div className='flex flex-col gap-y-4 h-[100vh]'>
                    <div className='flex flex-col gap-y-4 w-56'>
                        <Button
                            onClick={handleCopy}>
                            Copy
                        </Button>
                        <Button
                            onClick={handleDownload}>
                            Download
                        </Button>
                        {!clicked && <Button
                            onClick={() => {
                                setData({ name: '', config: '' })
                                setClicked(true)
                            }}
                        >
                            Create New
                        </Button>}

                        {clicked && <div className='flex gap-x-4'>
                            <Input
                                value={data.name}
                                onChange={handleChangeInput}
                                placeholder="config name"
                            />
                            <Button onClick={submitData}>
                                Submit
                            </Button>
                        </div>}
                    </div>
                    <div className='flex flex-col max-h-[400px] overflow-y-auto'>
                        {configs && configs?.length > 0 && configs.map((config) => {
                            return (
                                <div className='flex' key={config.id}>
                                    <Button className='min-w-[250px]'
                                        onClick={() => {
                                            setClicked(false)
                                            Router.push(`/config/${config.id}`)
                                            handleYamlValidation(config.config)
                                        }}
                                        variant={'outline'}>
                                        {config.name}
                                    </Button>
                                    <DeleteConfigButton config={config} />
                                </div>
                            )
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

