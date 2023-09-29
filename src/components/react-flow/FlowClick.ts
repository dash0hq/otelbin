// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import type { editor } from "monaco-editor";
import type { RefObject } from "react";
import JsYaml from "js-yaml";
import type { IConfig } from "./dataType";
import "./decorationStyles.css";

type EditorRefType = RefObject<editor.IStandaloneCodeEditor | null>;

export interface IData {
	label: string;
	parentNode: string;
	type?: string;
	id: string;
}

export function FlowClick(event: React.MouseEvent, data: IData, editorRef: EditorRefType | null) {
	event.stopPropagation();

	const configData = editorRef?.current?.getModel()?.getValue() || "";
	const jsonData = JsYaml.load(configData) as IConfig;
	const parents = Object.keys(jsonData?.service?.pipelines ?? {});

	const findMatch = (label: string) =>
		editorRef?.current?.getModel()?.findMatches(label, true, false, false, null, true);

	const indentationRegex = /^(\s*)/;

	const getStartPosition = (keyword: string) => {
		const positions = findMatch(keyword);
		const startLine = (positions && positions[0]?.range.startLineNumber) || 0;
		return { positions, startLine };
	};

	const { positions: pipelinePositions, startLine: pipeLinesStartLine } = getStartPosition("pipelines");
	const lines = editorRef?.current?.getModel()?.getValue().split(/\r?\n/) || [];
	const afterPipeLinesIndentationCount = lines[pipeLinesStartLine]?.match(indentationRegex)?.[0].length || 0;

	let pipeLinesEndLine = pipeLinesStartLine;
	for (let i = pipeLinesStartLine; i < lines.length; i++) {
		if ((lines[i]?.match(indentationRegex)?.[0].length || 0) >= afterPipeLinesIndentationCount) {
			pipeLinesEndLine += 1;
		}
	}

	const getStartPositionInPipeline = (keyword: string) => {
		const positions = findMatch(keyword);
		return (
			positions?.filter(
				(position) =>
					position.range.startLineNumber > getStartPosition("pipelines").startLine &&
					position.range.startLineNumber <= pipeLinesEndLine
			) || []
		);
	};

	const getStartPositionOffset = () => {
		const parentPosition = getStartPositionInPipeline(data.parentNode)[0];
		const childPosition = getStartPositionInPipeline(data.type || "").filter(
			(position) => position.range.startLineNumber >= ((parentPosition && parentPosition.range.startLineNumber) || 0)
		)[0];
		return (
			editorRef?.current?.getModel()?.getOffsetAt({
				column: childPosition?.range.startColumn || 0,
				lineNumber: childPosition?.range.startLineNumber || 0,
			}) || 0
		);
	};

	const getStartLineInPipeline = (keyword: string) => {
		const positions = findMatch(keyword);
		return positions?.filter(
			(position) =>
				position.range.startLineNumber > getStartPosition("pipelines").startLine &&
				position.range.startLineNumber < pipeLinesEndLine
		)[0]?.range.startLineNumber;
	};

	const goToSection = (keyword: string, startLine: number) => {
		const activePosition = findMatch(keyword)?.filter((position) => position.range.startLineNumber > startLine);
		const matchLabel = activePosition?.filter(
			(position) =>
				(editorRef?.current?.getModel()?.getOffsetAt({
					column: position.range.startColumn,
					lineNumber: position.range.startLineNumber,
				}) || 0) >= getStartPositionOffset()
		)[0];
		changePosition(matchLabel);

		let oldDecoration: string[] = [];

		const highlightDecoration: editor.IModelDeltaDecoration = {
			range: {
				startLineNumber: matchLabel?.range.startLineNumber || 0,
				startColumn: matchLabel?.range.startColumn || 0,
				endLineNumber: matchLabel?.range.endLineNumber || 0,
				endColumn: matchLabel?.range.endColumn || 0,
			},
			options: {
				isWholeLine: true,
				className: "lineDecoration",
				inlineClassName: "lineDecoration",
			},
		};

		const newDecorations = editorRef?.current?.getModel()?.deltaDecorations([], [highlightDecoration]) || [""];
		oldDecoration = newDecorations;
		setTimeout(() => {
			editorRef?.current?.getModel()?.deltaDecorations(oldDecoration, []);
		}, 550);
	};

	if (parents.includes(data.parentNode)) {
		goToSection(data.label, getStartLineInPipeline(data.parentNode) || 0);
	} else {
		changePosition(pipelinePositions?.[0]);
	}

	function changePosition(position?: editor.FindMatch) {
		editorRef?.current?.setPosition({
			lineNumber: position?.range.startLineNumber || 1,
			column: position?.range.startColumn || 1,
		});
		editorRef?.current?.focus();
		editorRef?.current?.revealPositionInCenter({
			lineNumber: position?.range.startLineNumber || 1,
			column: position?.range.startColumn || 1,
		});
	}
}
