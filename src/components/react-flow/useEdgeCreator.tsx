import { useEffect, useState } from 'react';
import type { Edge, Node } from 'reactflow';

function useEdgeCreator(nodeIdsArray: Node[]) {
  const nodeLogs = nodeIdsArray.filter((node) => node.parentNode === 'logs');
  const nodeMetrics = nodeIdsArray.filter((node) => node.parentNode === 'metrics');
  const nodeTraces = nodeIdsArray.filter((node) => node.parentNode === 'traces');

  const [edgeList, setEdgeList] = useState<Edge[]>([]);
  const edgesToAdd: Edge[] = [];
  const addToLogs = (nodeLogs: Node[]) => {
    for (let i = 0; i < nodeLogs.length - 1; i++) {
      const sourceNode = nodeLogs[i];
      const targetNode = nodeLogs[i + 1];

      if (!sourceNode || !targetNode) {
        // Handle the case when source or target node is undefined or null
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
  const addToMetrics = (nodeMetrics: Node[]) => {
    for (let i = 0; i < nodeMetrics.length - 1; i++) {
      const sourceNode = nodeMetrics[i];
      const targetNode = nodeMetrics[i + 1];

      if (!sourceNode || !targetNode) {
        // Handle the case when source or target node is undefined or null
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
  const addToTraces = (nodeTraces: Node[]) => {
    for (let i = 0; i < nodeTraces.length - 1; i++) {
      const sourceNode = nodeTraces[i];
      const targetNode = nodeTraces[i + 1];

      if (!sourceNode || !targetNode) {
        // Handle the case when source or target node is undefined or null
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
  useEffect(() => {
    if (!Array.isArray(nodeIdsArray) || nodeIdsArray.length < 2) {
      console.error('Invalid input: An array of at least two node IDs is required.');
      return;
    }

    addToLogs(nodeLogs)
    addToMetrics(nodeMetrics)
    addToTraces(nodeTraces)

    setEdgeList(edgesToAdd);
  }, [nodeIdsArray]);

  return edgeList;
}

export default useEdgeCreator;