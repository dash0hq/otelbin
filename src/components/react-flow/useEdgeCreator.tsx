import { useEffect, useRef, useState } from 'react';
import { Edge, ReactFlowInstance } from 'reactflow';

function useEdgeCreator(nodeIdsArray: string[], reactFlowInstance: ReactFlowInstance) {
  const [edgeList, setEdgeList] = useState<Edge[]>([]);
  const reactFlowInstanceRef = useRef(reactFlowInstance);

  useEffect(() => {
    if (!Array.isArray(nodeIdsArray) || nodeIdsArray.length < 2 || !reactFlowInstanceRef.current) {
      console.error('Invalid input: An array of at least two node IDs and a valid reactFlowInstance are required.');
      return;
    }

    const edgesToAdd: Edge[] = [];
    for (let i = 0; i < nodeIdsArray.length - 1; i++) {
      const sourceNodeId = nodeIdsArray[i] || '';
      const targetNodeId = nodeIdsArray[i + 1] || '';
      
      const edgeId = `edges-${sourceNodeId}-${targetNodeId}`;

      const edge: Edge = {
        id: edgeId,
        source: sourceNodeId,
        target: targetNodeId,
      };
      edgesToAdd.push(edge);
    }

    setEdgeList(edgesToAdd);
  }, []); // Empty dependency array to ensure the effect runs only once when the component mounts

  // Use another effect to add edges when the nodeIdsArray or reactFlowInstance changes
  useEffect(() => {
    if (reactFlowInstanceRef.current) {
      reactFlowInstanceRef.current.addEdges(edgeList);
    }
  }, [edgeList]);

  return edgeList;
}

export default useEdgeCreator;
