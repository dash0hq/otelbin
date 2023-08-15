import type { editor } from "monaco-editor";
import { type } from "os";
import type { RefObject } from "react";

type EditorRefType = RefObject<editor.IStandaloneCodeEditor | null>;

export interface IData {
    label: string;
    parentNode: string;
    type?: string;
}

export function FlowClick(event: React.MouseEvent, data: IData, editorRef: EditorRefType | null) {
    event.stopPropagation();

    const findMatch = (label: string) => editorRef?.current?.getModel()?.findMatches(label, true, false, false, null, true);

    const indentationRegex = /^(\s*)/;

    const getStartPosition = (keyword: string) => {
        const positions = findMatch(keyword);
        const startLine = positions && positions[0]?.range.startLineNumber || 0;
        return { positions, startLine };
    };

    const { positions: pipelinePositions, startLine: pipeLinesStartLine } = getStartPosition('pipelines');
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
        return positions?.filter((position) => position.range.startLineNumber > getStartPosition('pipelines').startLine && position.range.startLineNumber <= pipeLinesEndLine) || [];
    };

    const getStartPositionOffset = (parent: string, keyword: string) => {
        const parentPosition = getStartPositionInPipeline(data.parentNode)[0];
        const childPosition = getStartPositionInPipeline(data.type || '').filter((position) => position.range.startLineNumber >= (parentPosition && parentPosition.range.startLineNumber || 0))[0];
        return editorRef?.current?.getModel()?.getOffsetAt({ column: childPosition?.range.startColumn || 0, lineNumber: childPosition?.range.startLineNumber || 0 }) || 0;
    };

    const getStartLineInPipeline = (keyword: string) => {
        const positions = findMatch(keyword);
        return positions?.filter((position) => position.range.startLineNumber > getStartPosition('pipelines').startLine && position.range.startLineNumber < pipeLinesEndLine)[0]?.range.startLineNumber;
    };

    const goToSection = (keyword: string, startLine: number, type?: string,) => {
        const activePosition = findMatch(keyword)?.filter((position) => position.range.startLineNumber > startLine);
        const matchLabel = activePosition?.filter((position) => (editorRef?.current?.getModel()?.getOffsetAt({ column: position.range.startColumn, lineNumber: position.range.startLineNumber }) || 0) >= getStartPositionOffset(data.parentNode, keyword))[0];
        changePosition(matchLabel);
    };

    switch (data.parentNode) {
        case 'logs':
            goToSection(data.label, getStartLineInPipeline('logs') || 0, data.type);
            break;

        case 'metrics':
            goToSection(data.label, getStartLineInPipeline('metrics') || 0, data.type,);
            break;

        case 'traces':
            goToSection(data.label, getStartLineInPipeline('traces') || 0, data.type,);
            break;

        default:
            changePosition(pipelinePositions?.[0]);
            break;
    }

    function changePosition(position?: editor.FindMatch) {
        editorRef?.current?.setPosition({ lineNumber: position?.range.startLineNumber || 1, column: position?.range.startColumn || 1 });
        editorRef?.current?.focus();
        editorRef?.current?.revealPositionInCenter({ lineNumber: position?.range.startLineNumber || 1, column: position?.range.startColumn || 1 });
    }
}
