import Head from "next/head";
import { useState } from "react";
import MonacoEditor from "~/components/monaco-editor/MonacoEditor";
import { EditorProvider } from "~/contexts/EditorContext";

export default function Home() {
  const [locked, setLocked] = useState<boolean>(true);
  return (
    <>
      <Head>
        <title>OTelBin – powered by Dash0</title>
        <meta
          name="description"
          content="Edit, visualize and share OpenTelemetry Collector configurations"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen">
        <EditorProvider>
          <MonacoEditor locked={locked} setLocked={setLocked} />
        </EditorProvider>
      </main>
    </>
  );
}
