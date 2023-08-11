import { useRouter } from 'next/router'
import MonacoEditor from "~/components/monaco-editor/MonacoEditor";

export default function Config() {
    const router = useRouter()
    return (
        <>
            <div className="min-h-screen">
                <MonacoEditor id={router.query.id?.toString()} />
            </div>
        </>
    );
}