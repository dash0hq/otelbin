import React, { useMemo } from 'react';
import ReactFlow, { Background, Controls, MiniMap, useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import ReceiverNode from './ReceiverNode';
import ProcessorNode from './ProcessorNode';
import ExporterNode from './ExporterNode';
import { data } from './mockData';
import useExporterReader from './useExporterReader';
import useEdgeCreator from './useEdgeCreator';

export default function Flow({value}:{value: string}) {
  const reactFlowInstance = useReactFlow();
  const exportersArray= data.filter((item) => item.service);
  const jsonData = useExporterReader(exportersArray, reactFlowInstance);
  const nodeTypes = useMemo(() => ({ processorNode: ProcessorNode, receiverNode: ReceiverNode, exporterNode: ExporterNode  }), []);
  const createdNodes = reactFlowInstance.getNodes().filter(node => node.extent && (node.type === "processorNode" || "receiverNode" || "exporteNode")).map(id => id.id)
  const edges = useEdgeCreator(createdNodes, reactFlowInstance);

  const connectionLineStyle = { stroke: 'red`' };

  const edgeOptions = {
    animated: true,
    style: {
      stroke: '#000',
    },
  };
  
    return (
      <div style={{ height: '884px', width: "1040px" }}>
        <ReactFlow 
        defaultNodes={jsonData}
        defaultEdges={edges}
        defaultEdgeOptions={edgeOptions}
        nodeTypes={nodeTypes}
        fitView
        style={{
          backgroundColor: '#D3D2E5',
        }}
        connectionLineStyle={connectionLineStyle}
      >
        <Background />
        <Controls />
        <MiniMap />
        </ReactFlow>
      </div>
        
    );
  }