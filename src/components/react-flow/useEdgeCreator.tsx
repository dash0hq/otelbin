import { useEffect, useRef, useState } from 'react';
import type { Edge, ReactFlowInstance } from 'reactflow';

function useEdgeCreator(nodeIdsArray: string[], reactFlowInstance: ReactFlowInstance) {
  const initialEdges = reactFlowInstance.getEdges();
  const [edgeList, setEdgeList] = useState<Edge[]>(initialEdges);
  const reactFlowInstanceRef = useRef(reactFlowInstance);

  console.log(nodeIdsArray)
  useEffect(() => {
    if (!Array.isArray(nodeIdsArray) || nodeIdsArray.length < 2 || !reactFlowInstanceRef.current) {
      console.error('Invalid input: An array of at least two node IDs and a valid reactFlowInstance are required.');
      return;
    }

      const edgesToAdd: Edge[] = [];
      for (let i = 0; i < nodeIdsArray.length - 1; i++) {
        const sourceNodeId = nodeIdsArray[i] || '';
        const targetNodeId = nodeIdsArray[i + 1] || '';
        
        const edgeId = `edges-${(sourceNodeId).slice(0,6)}-${(targetNodeId).slice(0,6)}`;
    
        const edge: Edge = {
          id: edgeId,
          source: sourceNodeId,
          target: targetNodeId,
        };
        edgesToAdd.push(edge);
      }
      reactFlowInstance.addEdges(edgesToAdd);
      console.log(edgesToAdd);
      setEdgeList(edgesToAdd);
    
  }, [reactFlowInstance]);


  return edgeList;
}

export default useEdgeCreator;
