// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useEffect, useRef } from "react";
import type { editor } from "monaco-editor";
import { useEditorRef, useMountedMonaco } from "~/contexts/EditorContext";
import { findSubstitutions, renderSubstitutions } from "~/components/monaco-editor/envVars";
import { useEnvVars } from "./useEnvVars";
import "~/components/react-flow/decorationStyles.css";

/**
 * Decorates the editor with everything we know about variable substitution:
 * each `${...}` is highlighted, and every line holding one we can resolve gets
 * a trailing preview of the line as the collector would read it.
 *
 * The preview is injected text on a decoration rather than a real YAML comment
 * written into the document. A real comment would travel with the
 * configuration — into the URL, into shared links, and into what we send for
 * validation — and would have to be stripped again whenever a value changed.
 */
export function useSubstitutionDecorations() {
	const editorRef = useEditorRef();
	const monaco = useMountedMonaco();
	const { bindings } = useEnvVars();
	const decorations = useRef<editor.IEditorDecorationsCollection | null>(null);

	useEffect(() => {
		const codeEditor = editorRef?.current;
		if (!codeEditor || !monaco) {
			return;
		}

		function decorate() {
			const model = codeEditor?.getModel();
			if (!model || !monaco) {
				return;
			}

			const config = model.getValue();
			const { ranges } = findSubstitutions(config);

			const substitutions: editor.IModelDeltaDecoration[] = ranges.map((substitution) => {
				const start = model.getPositionAt(substitution.offset);
				const end = model.getPositionAt(substitution.offset + substitution.length);

				return {
					range: {
						startLineNumber: start.lineNumber,
						startColumn: start.column,
						endLineNumber: end.lineNumber,
						endColumn: end.column,
					},
					options: {
						isWholeLine: false,
						inlineClassName: substitution.kind === "env" ? "envVarDecoration" : "unresolvableSubstitutionDecoration",
						hoverMessage: {
							value:
								substitution.kind === "env"
									? "Environment variable. Bind a value to it to validate against a distribution."
									: "This substitution cannot be resolved during validation.",
						},
						stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
					},
				};
			});

			const previews: editor.IModelDeltaDecoration[] = renderSubstitutions(config, bindings).map((rendered) => {
				const column = model.getLineMaxColumn(rendered.line);

				return {
					range: {
						startLineNumber: rendered.line,
						startColumn: column,
						endLineNumber: rendered.line,
						endColumn: column,
					},
					options: {
						after: {
							content: `  # ${rendered.text.trim()}`,
							inlineClassName: "substitutionPreviewDecoration",
						},
						showIfCollapsed: true,
						stickiness: monaco.editor.TrackedRangeStickiness.NeverGrowsWhenTypingAtEdges,
					},
				};
			});

			decorations.current ??= codeEditor?.createDecorationsCollection() ?? null;
			decorations.current?.set([...substitutions, ...previews]);
		}

		decorate();
		// The model changes faster than the URL state the bindings come from, so
		// keep the highlighting in step with what is actually on screen.
		const subscription = codeEditor.onDidChangeModelContent(decorate);
		return () => subscription.dispose();
	}, [editorRef, monaco, bindings]);
}
