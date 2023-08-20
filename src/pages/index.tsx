import Head from "next/head";
import MonacoEditor from "~/components/monaco-editor/MonacoEditor";
import { EditorProvider } from "~/contexts/EditorContext";

export default function Home() {
  return (
    <>
      <Head>
        <title>OTelBin – powered by Dash0</title>
        <meta name="description" content="Edit, visualize and share OpenTelemetry Collector configurations" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen">
        <EditorProvider>
        <MonacoEditor />
        </EditorProvider>
      </main>
    </>
  );
}

