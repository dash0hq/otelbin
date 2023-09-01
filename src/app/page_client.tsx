"use client";

import { useState } from "react";
import { EditorProvider } from "~/contexts/EditorContext";
import MonacoEditor from "~/components/monaco-editor/MonacoEditor";

export function ClientPage() {
	const [locked, setLocked] = useState<boolean>(true);

	return (
		<EditorProvider>
			<MonacoEditor locked={locked} setLocked={setLocked} />
		</EditorProvider>
	);
}
