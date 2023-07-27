//React & Next
import { useRef, useState } from 'react';
import Router from 'next/router';
//Queries and scripts
import { IConfig, useConfigs, useInsertConfigs } from '~/queries/config';
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
import { ReactFlowProvider } from 'reactflow';
import Flow from './react-flow/ReactFlowCom';




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



    return (
        <div className="flex">
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
            <div className='flex flex-col gap-y-4 '>
                <ReactFlowProvider>
                    <Flow value={data.config} />
                </ReactFlowProvider>
            </div>

        </div>
    );
}