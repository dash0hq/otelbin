//React & Next
import { useRef, useState } from 'react';
import React from 'react';
//Queries and scripts
import { useConfigs, useInsertConfigs } from '~/queries/config';
//Internal components
import type { IAjvError, IError } from './ErrorConsole';
import { schema } from './JSONSchema';
import ErrorConsole from './ErrorConsole';
import { DefaultConfig } from './DefaultConfig';
//External libraries
import Editor from '@monaco-editor/react';
import type { Monaco, OnMount } from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import JsYaml from 'js-yaml';
import Ajv from "ajv"
import { ReactFlowProvider } from 'reactflow';
import Flow from './react-flow/ReactFlowCom';
//UI



export default function MonacoEditor({ id }: { id?: string }) {
    const editorRef = useRef<any>(null);
    const monacoRef = useRef<any>(null);
    const [clicked, setClicked] = useState(false)
    const [data, setData] = useState({ name: '', config: '' })
    const [errors, setErrors] = useState<IError>({});
    const { data: configs } = useConfigs()
    const mutation = useInsertConfigs()

    const [monacoInstance, setMonacoInstance] = React.useState<editor.IStandaloneCodeEditor | null>(null);

    const handleEditorDidMount: OnMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
        editorRef.current = editor;
        monacoRef.current = monaco;
        setMonacoInstance(editor);
    }


    function handleYamlValidation(configData: string) {
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


    return (
        <div className="flex">
            <div className='relative w-[50%]'>
                <Editor
                    defaultValue={DefaultConfig}
                    value={
                        !clicked ?
                            configs && configs?.length > 0 &&
                            configs.filter((config) => config.id?.toString() === id)[0]?.config || data.config
                            : data.config
                    }

                    onMount={handleEditorDidMount}
                    height="100vh"
                    width={'100%'}
                    defaultLanguage='yaml'
                    theme="vs-dark"
                    options={{ automaticLayout: true, minimap: { enabled: false } }}
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
            <div className='flex flex-col gap-y-4 '>
                <ReactFlowProvider>
                    <Flow value={errors?.jsYamlError === undefined && errors.ajvErrors?.length === 0 ? data.config : ''} />
                </ReactFlowProvider>
            </div>

        </div>
    );
}