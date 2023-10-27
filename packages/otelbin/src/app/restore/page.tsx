// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useUrlState } from "~/lib/urlState/client/useUrlState";
import { editorBinding } from "~/components/monaco-editor/editorBinding";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RestorePage() {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_, getLink] = useUrlState([editorBinding]);
	const router = useRouter();

	useEffect(() => {
		const newURLState: Record<string, string> = {};
		const persistedConfig = localStorage.getItem("config-restore");
		if (persistedConfig) {
			newURLState.config = persistedConfig;
		}
		router.push(getLink(newURLState, "/"));
	}, [getLink, router]);

	return null;
}
