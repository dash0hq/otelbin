import React, { useEffect, useMemo } from 'react';
import ReactFlow, { Background, Controls, useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import ReceiverNode from './ReceiverNode';
import ProcessorNode from './ProcessorNode';
import ExporterNode from './ExporterNode';
import { IConfig } from './mockData';
import useEdgeCreator from './useEdgeCreator';
import JsYaml from 'js-yaml';
import useConfigReader from './useConfigReader';

export default function Flow({ value }: { value: string }) {
  const reactFlowInstance = useReactFlow();
  const jsonData = useMemo(() => JsYaml.load(value) as IConfig, [value]);
  const nodes = useConfigReader(jsonData);
  const nodeTypes = useMemo(() => ({ processorNode: ProcessorNode, receiverNode: ReceiverNode, exporterNode: ExporterNode }), []);
  const edges = useEdgeCreator(nodes);
  console.log(edges);
  
  useEffect(() => {
      reactFlowInstance.addNodes(nodes);
      reactFlowInstance.addEdges(edges);
  }, [nodes, edges]);



  console.log(nodes);
  const edgeOptions = {
    animated: false,
    style: {
      stroke: '#000',
    },
  };

  return (
    <div style={{ height: '100vh', width: "1040px" }}>
      <ReactFlow
        defaultNodes={nodes}
        defaultEdges={edges}
        defaultEdgeOptions={edgeOptions}
        nodeTypes={nodeTypes}
        fitView
        style={{
          backgroundColor: '#D3D2E5',
        }}
        className="disable-attribution" 
      >
        <Background />
        <Controls />
        </ReactFlow>
      </div>
        
    );
  }