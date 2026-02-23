// SPDX-FileCopyrightText: 2025 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

// This module must be imported before monaco-editor initializes.
//
// It does two things:
// 1. Configures @monaco-editor/react to use the local monaco-editor build
//    instead of the CDN default (which may be a different version).
// 2. Sets window.MonacoEnvironment so getWorker is available when
//    monaco.editor.create() triggers worker creation.
//
// Using require() inside the typeof window guard avoids SSR crashes,
// since monaco-editor accesses browser globals on import.
//
// The new URL("...", import.meta.url) pattern is statically analyzed by
// webpack at build time to emit the worker files as separate chunks.

if (typeof window !== "undefined") {
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const monaco = require("monaco-editor");
	// eslint-disable-next-line @typescript-eslint/no-require-imports
	const { loader } = require("@monaco-editor/react");
	loader.config({ monaco });

	window.MonacoEnvironment = {
		getWorker(_, label) {
			switch (label) {
				case "editorWorkerService":
					return new Worker(new URL("monaco-editor/esm/vs/editor/editor.worker", import.meta.url));
				case "yaml":
					return new Worker(new URL("monaco-yaml/yaml.worker", import.meta.url));
				default:
					throw new Error(`Unknown label ${label}`);
			}
		},
	};
}
