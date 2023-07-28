import { useEffect, useState } from 'react';
import type { Edge, Node } from 'reactflow';

function useEdgeCreator(nodeIdsArray: Node[]) {
  const nodeLogs = nodeIdsArray.filter((node) => node.parentNode === 'logs');
  const nodeMetrics = nodeIdsArray.filter((node) => node.parentNode === 'metrics');
  const nodeTraces = nodeIdsArray.filter((node) => node.parentNode === 'traces');

  const [edgeList, setEdgeList] = useState<Edge[]>([]);

  useEffect(() => {
    if (!Array.isArray(nodeIdsArray) || nodeIdsArray.length < 2) {
      console.error('Invalid input: An array of at least two node IDs is required.');
      return;
    }

    const edgesToAdd: Edge[] = [];

    const addToEdges = (nodes: Node[]) => {
      for (let i = 0; i < nodes.length - 1; i++) {
        const sourceNode = nodes[i];
        const targetNode = nodes[i + 1];

        if (!sourceNode || !targetNode) {
          console.error('Invalid node found.');
          continue;
        }

        const sourceNodeId = sourceNode.id;
        const targetNodeId = targetNode.id;

        const edgeId = `edge-${sourceNodeId}-${targetNodeId}`;

        const edge: Edge = {
          id: edgeId,
          source: sourceNodeId,
          target: targetNodeId,
        };
        edgesToAdd.push(edge);
      }
    };

    addToEdges(nodeLogs);
    addToEdges(nodeMetrics);
    addToEdges(nodeTraces);

    if (nodeTraces.length > 0) {
      const lastProcessorNode = nodeTraces[nodeTraces.length - 1];
      const exporterNodes = nodeIdsArray.filter((node) => node.type === 'exporterNode');
      
      if (exporterNodes.length > 0) {
        const firstExporterNode = exporterNodes[0];
        const edgeId = `edge-${lastProcessorNode?.id}-${firstExporterNode?.id}`;
        
        const edge: Edge = {
          id: edgeId,
          source: lastProcessorNode?.id!,
          target: firstExporterNode?.id!,
        };
        edgesToAdd.push(edge);
      }
    }

    setEdgeList(edgesToAdd);
  }, [nodeIdsArray]);

  return edgeList;
}

export default useEdgeCreator;
