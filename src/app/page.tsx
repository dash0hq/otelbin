"use client";

import MonacoEditor from "~/components/monaco-editor/MonacoEditor";
import { EditorProvider } from "~/contexts/EditorContext";
import { useState } from "react";

export default function Page() {
	const [locked, setLocked] = useState<boolean>(true);

	return (
		<EditorProvider>
			<MonacoEditor locked={locked} setLocked={setLocked} />
		</EditorProvider>
	);
}
