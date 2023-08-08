import React, { useMemo } from 'react';
import ReactFlow, { Panel, useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import type { IConfig } from './dataType';
import JsYaml from 'js-yaml';
import useConfigReader from './useConfigReader';
import useEdgeCreator from './useEdgeCreator';
import { useEditorRef } from '~/contexts/EditorContext';
import { FlowClick } from './FlowClick';
import { ControlButton } from '@reactflow/controls';
import { MaximizeIcon, MinusIcon, PlusIcon } from 'lucide-react';
import ParentNodeType from './ParentNodeType';
import ReceiversNode from './ReceiversNode';
import ProcessorsNode from './ProcessorsNode';
import ExportersNode from './ExportersNode';

const controlButtonStyle = {
  backgroundColor: "#293548",
  color: "#94A3B8",
  borderBottom: "1px solid #293548",
  paddingTop: 8.5,
  paddingBottom: 8.5,
  paddingLeft: 13.5,
  paddingRight: 13.5,
}
export default function Flow({ value }: { value: string }) {
  const reactFlowInstance = useReactFlow();
  const jsonData = useMemo(() => JsYaml.load(value) as IConfig, [value]);
  const nodes = useConfigReader(jsonData, reactFlowInstance);
  const nodeTypes = useMemo(() => ({ processorsNode: ProcessorsNode, receiversNode: ReceiversNode, exportersNode: ExportersNode, parentNodeType: ParentNodeType }), []);
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
      setViewport(parentLogNodePosition, { duration: 400 });
    } else if (e.position.lineNumber === tracesLinePosition) {
      setViewport(parentTraceNodePosition, { duration: 400 });
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
      y: -Number(nodeInfo?.find((node) => node.id === nodeId && node.type === 'parentNodeType')?.position?.y) || 0,
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
        <Panel position="bottom-left" className='flex gap-2'>
          <div className='flex gap-0.5 '>
            <ControlButton onClick={() => reactFlowInstance.zoomIn()} title="Zoom-In" className='z-10 rounded-l-sm' style={controlButtonStyle}>
            <PlusIcon />
            </ControlButton>
            <ControlButton onClick={() => reactFlowInstance.zoomOut()} title="Zoom-In" className='z-10 rounded-r-sm' style={controlButtonStyle}>
            <MinusIcon />
            </ControlButton>
          </div>
            <ControlButton onClick={() => reactFlowInstance.fitView()} title="Zoom-In" className='rounded-sm' style={controlButtonStyle}>
            <MaximizeIcon size={84}/>
            </ControlButton>
        </Panel>
          
        </ReactFlow>
      </div>
        
    );
  }