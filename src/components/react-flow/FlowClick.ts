import type { editor } from "monaco-editor";
import type { RefObject } from "react";


type EditorRefType = RefObject<editor.IStandaloneCodeEditor | null>;

interface IData {
    label: string;
    parentNode: string;
}

export function FlowClick(event: React.MouseEvent, data: IData, editorRef: EditorRefType | null, section: string) {
    event.stopPropagation();

    const findMatch = (label: string) => (editorRef?.current?.getModel()?.findMatches(label, true, false, false, null, true));

    const indentationRegex = /^(\s*)/;

    const pipelinePositions: editor.FindMatch[] | undefined = findMatch('pipelines');
    const pipeLinePosition = pipelinePositions && pipelinePositions.length > 0 && pipelinePositions[0] || null;
    const lines = editorRef?.current?.getModel()?.getValue().split(/\r?\n/) || [];
    const afterPipeLinesIndentationCount = lines[pipeLinePosition?.range.startLineNumber || 0]?.match(indentationRegex)?.[0].length || 0;

    const pipeLinesStartNumber = pipeLinePosition?.range.startLineNumber || 0;
    let pipeLinesEndLine = pipeLinesStartNumber || 0;
    for (let i = pipeLinesStartNumber || 0; i < lines.length; i++) {
        if (lines[i]?.match(indentationRegex)?.[0].length || 0 >= afterPipeLinesIndentationCount) (pipeLinesEndLine += 1);
    }

    const logsPositions: editor.FindMatch[] | undefined = findMatch('logs');
    const logsPosition = logsPositions && logsPositions.length > 0 && logsPositions.filter((position) => {
        return position.range.startLineNumber > pipeLinesStartNumber && position.range.startLineNumber <= pipeLinesEndLine
    });
    const logsStartLine = logsPosition && logsPosition[0] && logsPosition[0].range.startLineNumber || 0;


    const tracesPositions: editor.FindMatch[] | undefined = findMatch('traces');
    const tracesPosition = tracesPositions && tracesPositions.length > 0 && tracesPositions.filter((position) => {
        return position.range.startLineNumber > pipeLinesStartNumber && position.range.startLineNumber < pipeLinesEndLine
    });
    const tracesStartLine = tracesPosition && tracesPosition[0] && tracesPosition[0].range.startLineNumber || 0;


    const metricsPositions: editor.FindMatch[] | undefined = findMatch('metrics');
    const metricsPosition = metricsPositions && metricsPositions.length > 0 && metricsPositions.filter((position) => {
        return position.range.startLineNumber > pipeLinesStartNumber && position.range.startLineNumber < pipeLinesEndLine
    });
    const metricsStartLine = metricsPosition && metricsPosition[0] && metricsPosition[0].range.startLineNumber || 0;

    const changePosition = (position: editor.FindMatch[]) => {
        editorRef?.current?.setPosition({ lineNumber: position[0] && position[0].range.startLineNumber || 1, column: position[0] && position[0].range.startColumn || 1 });
        editorRef?.current?.focus();
        editorRef?.current?.revealPositionInCenter({ lineNumber: position[0] && position[0].range.startLineNumber || 1, column: position[0] && position[0].range.startColumn || 1 });
    }

    let activePosition: editor.FindMatch[] | undefined = [];
    let activePositionStartLine = 0;
    let labelPosition: editor.FindMatch[] | undefined = []

    switch (data.parentNode) {
        case 'logs':
            switch (section) {
                case 'receivers':
                    activePosition = findMatch('receivers')?.filter((position) => {
                        return position.range.startLineNumber > logsStartLine
                    })

                    break;
                case 'processors':
                    activePosition = findMatch('processors')?.filter((position) => {
                        return position.range.startLineNumber > logsStartLine
                    })
                    break;
                case 'exporters':
                    activePosition = findMatch('exporters')?.filter((position) => {
                        return position.range.startLineNumber > logsStartLine
                    })
                    break;
            }
            activePositionStartLine = activePosition && activePosition[0] && activePosition[0].range.startLineNumber || 0;
            labelPosition = findMatch(data.label)?.filter((position) => {
                return position.range.startLineNumber > activePositionStartLine || 0
            })
            changePosition(labelPosition || []);
            break;

        case 'metrics':
            switch (section) {
                case 'receivers':
                    activePosition = findMatch('receivers')?.filter((position) => {
                        return position.range.startLineNumber > metricsStartLine
                    })

                    break;
                case 'processors':
                    activePosition = findMatch('processors')?.filter((position) => {
                        return position.range.startLineNumber > metricsStartLine
                    })
                    break;
                case 'exporters':
                    activePosition = findMatch('exporters')?.filter((position) => {
                        return position.range.startLineNumber > metricsStartLine
                    })
                    break;
            }
            activePositionStartLine = activePosition && activePosition[0] && activePosition[0].range.startLineNumber || 0;
            labelPosition = findMatch(data.label)?.filter((position) => {
                return position.range.startLineNumber > activePositionStartLine || 0
            })
            changePosition(labelPosition || []);
            break;

        case 'traces':
            switch (section) {
                case 'receivers':
                    activePosition = findMatch('receivers')?.filter((position) => {
                        return position.range.startLineNumber > tracesStartLine
                    })

                    break;
                case 'processors':
                    activePosition = findMatch('processors')?.filter((position) => {
                        return position.range.startLineNumber > tracesStartLine
                    })
                    break;
                case 'exporters':
                    activePosition = findMatch('exporters')?.filter((position) => {
                        return position.range.startLineNumber > tracesStartLine
                    })
                    break;
            }
            activePositionStartLine = activePosition && activePosition[0] && activePosition[0].range.startLineNumber || 0;
            labelPosition = findMatch(data.label)?.filter((position) => {
                return position.range.startLineNumber > activePositionStartLine || 0
            })
            changePosition(labelPosition || []);
            break;

        default:
            changePosition(pipelinePositions || []);
            break;
    }
}

