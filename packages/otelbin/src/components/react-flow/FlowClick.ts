// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import type { editor } from "monaco-editor";
import type { RefObject } from "react";
import "./decorationStyles.css";
import {
	type IValidateItem,
	type IItem,
	type ILeaf,
	extractMainItemsData,
	extractServiceItems,
	findLineAndColumn,
	findPipelinesKeyValues,
	getYamlDocument,
} from "../monaco-editor/parseYaml";
type EditorRefType = RefObject<editor.IStandaloneCodeEditor | null>;

export interface IData {
	label: string;
	parentNode: string;
	type: string;
	id: string;
}

export function FlowClick(
	event: React.MouseEvent | React.KeyboardEvent<HTMLDivElement>,
	data: IData,
	editorRef: EditorRefType | null
) {
	event.stopPropagation();
	const config = editorRef?.current?.getModel()?.getValue() || "";
	const docElements = getYamlDocument(config);
	const mainItemsData: IValidateItem = extractMainItemsData(docElements);
	let pipelinesKeyValues: IValidateItem | undefined = {};
	const serviceItems: IItem[] | undefined = extractServiceItems(docElements);
	const pipeLineItems: IItem[] | undefined = serviceItems?.filter((item: IItem) => item.key?.source === "pipelines");

	pipelinesKeyValues = findPipelinesKeyValues(
		pipeLineItems,
		docElements.filter((item: IItem) => item.key?.source === "pipelines")[0],
		docElements.filter((item: IItem) => item.key?.source === "service")[0],
		pipelinesKeyValues
	);

	const isConnector = data.type.includes("connectors");
	const dataType = (event.altKey ? (isConnector ? data.type.split("/")[1] : data.type) : data.type.split("/")[0]) ?? "";
	const clickedItem = findClickedItem(data.label, dataType, mainItemsData, pipelinesKeyValues);

	if (clickedItem) {
		const { line, column } = findLineAndColumn(config, clickedItem.offset);
		changePosition(line, column);
		changeDecoration(clickedItem, line, column);
	}

	function findClickedItem(
		label: string,
		dataType: string,
		mainItemsData: IValidateItem,
		pipelinesKeyValues?: IValidateItem
	) {
		if (event.altKey) {
			return pipelinesKeyValues?.[dataType]
				?.filter((item) => item.level1Parent === data.parentNode)
				.find((item) => item.source === label);
		} else {
			return mainItemsData[dataType]?.find((item) => item.source === label);
		}
	}

	function changePosition(line: number, column: number) {
		editorRef?.current?.setPosition({
			lineNumber: line,
			column: column,
		});
		editorRef?.current?.focus();
		editorRef?.current?.revealPositionInCenter({
			lineNumber: line,
			column: column,
		});
	}

	function changeDecoration(clickedItem: ILeaf | undefined, line: number, column: number) {
		let oldDecoration: string[] = [];

		const highlightDecoration: editor.IModelDeltaDecoration = {
			range: {
				startLineNumber: line ?? 0,
				startColumn: column ?? 0,
				endLineNumber: line ?? 0,
				endColumn: column + (clickedItem?.source?.length ?? 0),
			},
			options: {
				isWholeLine: true,
				className: "lineDecoration",
				inlineClassName: "lineDecoration",
			},
		};

		const newDecorations = editorRef?.current?.getModel()?.deltaDecorations([], [highlightDecoration]) ?? [""];
		oldDecoration = newDecorations;
		setTimeout(() => {
			editorRef?.current?.getModel()?.deltaDecorations(oldDecoration, []);
		}, 550);
	}
}
