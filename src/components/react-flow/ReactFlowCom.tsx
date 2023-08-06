import React, { useMemo } from 'react';
import ReactFlow, { Controls, useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import ReceiverNode from './ReceiverNode';
import ProcessorNode from './ProcessorNode';
import ExporterNode from './ExporterNode';
import type { IConfig } from './mockData';
import JsYaml from 'js-yaml';
import useConfigReader from './useConfigReader';
import parentNodeType from './parentNodeType';
import useEdgeCreator from './useEdgeCreator';
import { useEditorRef } from '~/contexts/EditorContext';
import { FlowClick } from './FlowClick';

export default function Flow({ value }: { value: string }) {
  const reactFlowInstance = useReactFlow();
  const jsonData = useMemo(() => JsYaml.load(value) as IConfig, [value]);
  const nodes = useConfigReader(jsonData, reactFlowInstance);
  const nodeTypes = useMemo(() => ({ processorNode: ProcessorNode, receiverNode: ReceiverNode, exporterNode: ExporterNode, parentNodeType: parentNodeType }), []);
  const edges = useEdgeCreator(nodes, reactFlowInstance);
  const editorRef = useEditorRef();
  const { setViewport } = useReactFlow();


  const edgeOptions = {
    animated: false,
    style: {
      stroke: '#fff',
    },
  };

  function handleClickBackground(event: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    FlowClick(event, { label: 'pipelines', parentNode: '' }, editorRef, "pipelines");
  }

  const nodeInfo = reactFlowInstance.getNodes();

  editorRef?.current?.onDidChangeCursorPosition(handleCursorPositionChange);

  function handleCursorPositionChange(e: any) {
    const lines = editorRef?.current?.getModel()?.getLinesContent();
    const pipeLinesPosition = lines?.findIndex((line) => line.includes('pipelines:')) || 0;

    const logsLinePosition = findSectionLine('logs:', pipeLinesPosition, lines);
    const tracesLinePosition = findSectionLine('traces:', pipeLinesPosition, lines);
    const metricsLinePosition = findSectionLine('metrics:', pipeLinesPosition, lines);

    const parentLogNodePosition = getNodePosition('logs');
    const parentTraceNodePosition = getNodePosition('traces');
    const parentMetricsNodePosition = getNodePosition('metrics');

    if (e.position.lineNumber === logsLinePosition) {
      setViewport(parentTraceNodePosition, { duration: 400 });
    } else if (e.position.lineNumber === tracesLinePosition) {
      setViewport(parentLogNodePosition, { duration: 400 });
    } else if (e.position.lineNumber === metricsLinePosition) {
      setViewport(parentMetricsNodePosition, { duration: 400 });
    } else {
      setViewport({ x: 0, y: 0, zoom: 1 }, { duration: 800 });
    }
  }

  function findSectionLine(sectionKeyword: string, startIndex: number, lines?: string[]) {
    return Number(lines?.findIndex((line) => line.includes(sectionKeyword) && lines.indexOf(line) > startIndex)) + 1 || 0;
  }

  function getNodePosition(nodeId: string) {
    return {
      x: Number(nodeInfo?.find((node) => node.id === nodeId && node.type === 'parentNodeType')?.position?.x) || 0,
      y: Number(nodeInfo?.find((node) => node.id === nodeId && node.type === 'parentNodeType')?.position?.y) || 0,
      zoom: 1
    };
  }

  return (
    <div className='z-0' style={{ height: '100vh', width: "1040px" }}>
      <ReactFlow
        onClick={handleClickBackground}
        nodes={nodes}
        edges={edges}
        defaultEdgeOptions={edgeOptions}
        nodeTypes={nodeTypes}
        fitView
        style={{
          backgroundColor: '#000',
        }}
        className="disable-attribution" 
      >
        <Controls />
        </ReactFlow>
      </div>
        
    );
  }