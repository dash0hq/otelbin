// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

"use client";

import { Suspense, useEffect, useState } from "react";
import { EditorProvider } from "~/contexts/EditorContext";
import Editor from "~/components/monaco-editor/Editor";
import type { AppCapabilities } from "~/lib/capabilities";

export default function ClientPage({ capabilities }: { capabilities: AppCapabilities }) {
	const [locked, setLocked] = useState<boolean>(true);
	const [isClient, setIsClient] = useState<boolean>(false);
	useEffect(() => setIsClient(true), []);

	return (
		<Suspense>
			<EditorProvider>
				{isClient && <Editor locked={locked} setLocked={setLocked} capabilities={capabilities} />}
			</EditorProvider>
		</Suspense>
	);
}
