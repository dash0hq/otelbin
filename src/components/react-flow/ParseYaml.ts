import { useEditorRef } from "~/contexts/EditorContext";
import { Parser } from 'yaml'
import { useMemo } from "react";

export interface IParseParentType {
    level2Field: number;
    receivers: number;
    processors: number;
    exporters: number;
}
const level3Offsets = { level2Field: 0, receivers: 0, processors: 0, exporters: 0 };

export function ParseYaml(field: string) {

    const editorRef = useEditorRef();
    const yamlContent = editorRef?.current?.getValue() || '';

    const docPipelines = useMemo(() => {
        const parsedYaml = Array.from(new Parser().parse(yamlContent));
        const doc = parsedYaml.find(token => token.type === 'document') as any;
        const docItems = doc?.value.items.length > 0 && doc.value.items || [];
        const docService = docItems.find((item: any) => item.key.source === 'service');
        return docService?.value.items.find((item: any) => item.key.source === 'pipelines');
    }, [yamlContent]);

    const level2Offset = (keyword: string) => {
        return docPipelines && docPipelines.value && docPipelines.value.items.filter((item: any) => item.key.source === keyword)[0] && docPipelines.value.items.filter((item: any) => item.key.source === keyword)[0].key.offset || 0;
    }

    const level3Offset = (level2Keyword: string, keyword: string) => {
        return docPipelines && docPipelines.value.items.filter((item: any) => item.key.source === level2Keyword)[0] && docPipelines.value.items.filter((item: any) => item.key.source === level2Keyword)[0].value.items.filter((item: any) => item.key.source === keyword)[0].key.offset
            || 0;
    }

    switch (field) {
        case 'pipelines':
            return docPipelines;
        case 'logs':
            level3Offsets.level2Field = level2Offset('logs');
            level3Offsets.receivers = level3Offset('logs', 'receivers');
            level3Offsets.processors = level3Offset('logs', 'processors');
            level3Offsets.exporters = level3Offset('logs', 'exporters');
            return level3Offsets;
        case 'metrics':
            level3Offsets.level2Field = level2Offset('metrics');
            level3Offsets.receivers = level3Offset('metrics', 'receivers');
            level3Offsets.processors = level3Offset('metrics', 'processors');
            level3Offsets.exporters = level3Offset('metrics', 'exporters');
            return level3Offsets;
        case 'traces':
            level3Offsets.level2Field = level2Offset('traces');
            level3Offsets.receivers = level3Offset('traces', 'receivers');
            level3Offsets.processors = level3Offset('traces', 'processors');
            level3Offsets.exporters = level3Offset('traces', 'exporters');
            return level3Offsets;
    }

}