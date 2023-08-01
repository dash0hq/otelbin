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

export default function Flow({ value }: { value: string }) {
  const reactFlowInstance = useReactFlow();
  const jsonData = useMemo(() => JsYaml.load(value) as IConfig, [value]);
  const nodes = useConfigReader(jsonData, reactFlowInstance);
  const nodeTypes = useMemo(() => ({ processorNode: ProcessorNode, receiverNode: ReceiverNode, exporterNode: ExporterNode, parentNodeType: parentNodeType }), []);
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
        <Controls />
        </ReactFlow>
      </div>
        
    );
  }