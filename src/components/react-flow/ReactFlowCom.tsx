import React, { useCallback, useMemo } from 'react';
import ReactFlow, { Background, Controls, Edge, MiniMap, Node, useReactFlow } from 'reactflow';
import 'reactflow/dist/style.css';
import ReceiverNode from './ReceiverNode';
import ProcessorNode from './ProcessorNode';
import ExporterNode from './ExporterNode';
import { data } from './mockData';
import useExporterReader from './useExporterReader';

// const initialEdges = [];

const exportersArray: Node[] = [
  {
    id: '1', // required
    position: { x: 0, y: 0 }, // required
    data: { label: 'Node 1' },
  },
  {
    id: '2',
    position: { x: 100, y: 100 },
    data: { label: 'Node 2' },
  },
  {
    id: '3',
    position: { x: 200, y: 200 },
    data: { label: 'Node 3' },
    type:"proccessorNode"
  },
];

const initialEdges: Edge[] = 
[];

export default function Flow({value}:{value: string}) {
  const reactFlowInstance = useReactFlow();
  const exportersArray= data.filter((item) => item.service);
  const jsonData = useExporterReader(exportersArray, reactFlowInstance);
  const nodeTypes = useMemo(() => ({ processorNode: ProcessorNode, receiverNode: ReceiverNode, exporterNode: ExporterNode  }), []);
    console.log(reactFlowInstance)
    let nodeId = 0;
    
console.log(jsonData)

  const handleAddNode = useCallback((type: string, label: string) => {
    const id = `${++nodeId}`;
    const newNode = {
      id,
      position: {
        x: Math.random() * 100,
        y: Math.random() * 100,
      },
      type: type === "processor" ? "processorNode" : type === "receiver" ? "receiverNode" : "exporterNode",
      data: {
        label: `Node ${id}`,
      },
    };
    reactFlowInstance.addNodes(newNode);
    console.log(reactFlowInstance)
  }, []);

  const connectionLineStyle = { stroke: 'red`' };

  const edgeOptions = {
    animated: true,
    style: {
      stroke: 'white',
    },
  };
  
    return (
      <div style={{ height: '884px', width: "1040px" }}>
        <ReactFlow 
        defaultNodes={jsonData}
        defaultEdges={initialEdges}
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
        {/* <div className='flex flex-col items-end'>
          <button onClick={() => handleAddNode("processor", "processor")} className="btn-add">
            add node
          </button>
          <button onClick={() => handleAddNode("receiver", "receiver")} className="btn-add">
            add receiver
          </button>
          <button onClick={() => handleAddNode("exporter", "exporter")} className="btn-add">
            add exporter
          </button>
        </div> */}

      </div>
        
    );
  }