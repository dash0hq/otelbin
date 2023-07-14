import React, { useCallback } from 'react';
import ReactFlow, { Background, Connection, Controls, Edge, EdgeChange, NodeChange, addEdge, applyEdgeChanges, applyNodeChanges } from 'reactflow';
import 'reactflow/dist/style.css';

// const initialEdges = [];

const initialNodes = [
  {
    id: '1', // required
    position: { x: 0, y: 0 }, // required
    data: { label: 'Node 1' },
  },
  {
    id: '2',
    position: { x: 100, y: 100 },
    data: { label: 'World' },
  },
];


export default function Flow() {
  const [nodes, setNodes] = React.useState(initialNodes);
  const [edges, setEdges] = React.useState<Edge<any>[]>([]);
  const onConnect = useCallback((params: Edge | Connection) => setEdges((eds) => addEdge(params, eds)), []);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((n) => applyNodeChanges(changes, n)), []);  
  const onEdgesChange = useCallback(
    (changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    []
  ); 
    return (
      <div style={{ height: '800px', width: "800px" }}>
        <ReactFlow 
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
         >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    );
  }