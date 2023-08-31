import { useRouter } from "next/router";
import { useState } from "react";
import MonacoEditor from "~/components/monaco-editor/MonacoEditor";

export default function Config() {
  const router = useRouter();
  const [locked, setLocked] = useState<boolean>(false);
  return (
    <>
      <div className="min-h-screen">
        <MonacoEditor
          id={router.query.id?.toString()}
          locked={locked}
          setLocked={setLocked}
        />
      </div>
    </>
  );
}
