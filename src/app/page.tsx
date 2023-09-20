// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useEffect, useState } from "react";
import { EditorProvider } from "~/contexts/EditorContext";
import Editor from "~/components/monaco-editor/Editor";

export default function Page() {
	const [locked, setLocked] = useState<boolean>(true);
	const [isClient, setIsClient] = useState<boolean>(false);
	useEffect(() => setIsClient(true), []);

	return <EditorProvider>{isClient && <Editor locked={locked} setLocked={setLocked} />}</EditorProvider>;
}
