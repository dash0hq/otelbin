import type { editor } from "monaco-editor";
import type { RefObject } from "react";

type EditorRefType = RefObject<editor.IStandaloneCodeEditor | null>;

interface IData {
    label: string;
    parentNode: string;
}

export function FlowClick(event: React.MouseEvent, data: IData, editorRef: EditorRefType | null, section: string) {
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
        return positions?.filter((position) => position.range.startLineNumber > getStartPosition('pipelines').startLine && position.range.startLineNumber < pipeLinesEndLine)[0]?.range.startLineNumber;
    };

    const goToSection = (keyword: string, startLine: number) => {
        const activePosition = findMatch(keyword)?.filter((position) => position.range.startLineNumber > startLine);
        const labelPosition = findMatch(data.label)?.filter((position) => position.range.startLineNumber > (activePosition && activePosition[0]?.range.startLineNumber || 0));
        changePosition(labelPosition || []);
    };

    switch (data.parentNode) {
        case 'logs':
            goToSection(section, getStartPositionInPipeline('logs') || 0);
            break;

        case 'metrics':
            goToSection(section, getStartPositionInPipeline('metrics') || 0);
            break;

        case 'traces':
            goToSection(section, getStartPositionInPipeline('traces') || 0);
            break;

        default:
            changePosition(pipelinePositions || []);
            break;
    }

    function changePosition(position: editor.FindMatch[]) {
        editorRef?.current?.setPosition({ lineNumber: position[0]?.range.startLineNumber || 1, column: position[0]?.range.startColumn || 1 });
        editorRef?.current?.focus();
        editorRef?.current?.revealPositionInCenter({ lineNumber: position[0]?.range.startLineNumber || 1, column: position[0]?.range.startColumn || 1 });
    }
}
