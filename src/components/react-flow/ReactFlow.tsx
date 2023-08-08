import React, { useMemo } from 'react';
import ReactFlow, { Panel, useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import type { IConfig } from './dataType';
import JsYaml from 'js-yaml';
import useConfigReader from './useConfigReader';
import useEdgeCreator from './useEdgeCreator';
import { ControlButton } from '@reactflow/controls';
import { MaximizeIcon, MinusIcon, PlusIcon } from 'lucide-react';
import exportersNode from './ExportersNode';
import receiversNode from './ReceiversNode';
import processorsNode from './ProcessorsNode';
import ParentNodeType from './ParentNodeType';

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
  const nodeTypes = useMemo(() => ({ processorsNode: processorsNode, receiversNode: receiversNode, exportersNode: exportersNode, parentNodeType: ParentNodeType }), []);
  const edges = useEdgeCreator(nodes, reactFlowInstance);

  const edgeOptions = {
    animated: false,
    style: {
      stroke: '#fff',
    },
  };

  return (
    <div style={{ height: '100vh', width: "1040px" }}>
      <ReactFlow
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