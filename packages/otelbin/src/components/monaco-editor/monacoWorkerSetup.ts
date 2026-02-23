// SPDX-FileCopyrightText: 2025 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

// This module must be imported before monaco-editor initializes.
// Setting window.MonacoEnvironment at module scope ensures getWorker is
// available when monaco.editor.create() triggers worker creation.
//
// The new URL("...", import.meta.url) pattern is statically analyzed by
// webpack at build time to emit the worker files as separate chunks.

if (typeof window !== "undefined") {
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
