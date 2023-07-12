import Editor from '@monaco-editor/react';
import { Button } from './ui/button';

export default function MonacoEditor() {

    return (
        <div className="flex gap-x-4">
            <Editor
                height="100vh"
                width={'50%'}
                defaultLanguage="yaml"
                defaultValue="hello world"
                theme="vs-dark"
                options={{ automaticLayout: true }}
            />
            <div className='flex flex-col gap-y-4'>
            </div>
        </div>
    );
}