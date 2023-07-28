import { useEffect, useState } from 'react';
import type { Edge, Node } from 'reactflow';

function useEdgeCreator(nodeIdsArray: Node[]) {
  const nodeLogs = nodeIdsArray.filter((node) => node.parentNode === 'logs');
  const nodeMetrics = nodeIdsArray.filter((node) => node.parentNode === 'metrics');
  const nodeTraces = nodeIdsArray.filter((node) => node.parentNode === 'traces');

  const [edgeList, setEdgeList] = useState<Edge[]>([]);
  const edgesToAdd: Edge[] = [];

  const calculateExportersNode = (exporterNodes: Node[], processorNode: Node) => {
    exporterNodes.forEach((targetNode) => {
      if (!processorNode || !targetNode) {
        return;
      }
      const sourceNodeId = processorNode.id;
      const targetNodeId = targetNode.id;
      const edgeId = `edge-${sourceNodeId}-${targetNodeId}`;
      const edge: Edge = {
        id: edgeId,
        source: sourceNodeId,
        target: targetNodeId,
      };
      edgesToAdd.push(edge);
    });
  };
  const calculateProcessorNode = (processorNodes: Node[]) => {
    for (let i = 0; i < processorNodes.length - 1; i++) {
      const sourceNode = processorNodes[i];
      const targetNode = processorNodes[i + 1];
      if (!sourceNode || !targetNode) {
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
  const calculateReceiverNode = (receiverNodes: Node[], firstProcessorNode: Node) => {
    receiverNodes.forEach((sourceNode) => {
      if (!receiverNodes || !sourceNode) {
        return;
      }
      const sourceNodeId = sourceNode.id;
      const targetNodeId = firstProcessorNode.id;
      const edgeId = `edge-${sourceNodeId}-${targetNodeId}`;
      const edge: Edge = {
        id: edgeId,
        source: sourceNodeId,
        target: targetNodeId,
      };
      edgesToAdd.push(edge);
    });
  };
  
  const addToLogs = (nodeLogs: Node[]) => {
    const exporterNodes = nodeLogs.filter((node) => node.type === 'exporterNode');
    const processorNodes = nodeLogs.filter((node) => node.type === 'processorNode');
    const receiverNodes = nodeLogs.filter((node) => node.type === 'receiverNode');
    const firstProcessorNode = processorNodes[0] as Node;
      const lastProcessorNode = processorNodes[processorNodes.length - 1] as Node;
      calculateExportersNode(exporterNodes, lastProcessorNode);
  
    calculateProcessorNode(processorNodes);
    calculateReceiverNode(receiverNodes, firstProcessorNode);
  };
  const addToMetrics = (nodeMetrics: Node[]) => {
    const exporterNodes = nodeMetrics.filter((node) => node.type === 'exporterNode');
    const processorNodes = nodeMetrics.filter((node) => node.type === 'processorNode');
    const receiverNodes = nodeMetrics.filter((node) => node.type === 'receiverNode');
    const firstProcessorNode = processorNodes[0] as Node;
      const lastProcessorNode = processorNodes[processorNodes.length - 1] as Node;
      calculateExportersNode(exporterNodes, lastProcessorNode);
  
    calculateProcessorNode(processorNodes);
    calculateReceiverNode(receiverNodes, firstProcessorNode);
  };
  const addToTraces = (nodeTraces: Node[]) => {
    const exporterNodes = nodeTraces.filter((node) => node.type === 'exporterNode');
    const processorNodes = nodeTraces.filter((node) => node.type === 'processorNode');
    const receiverNodes = nodeTraces.filter((node) => node.type === 'receiverNode');
    const firstProcessorNode = processorNodes[0] as Node;
      const lastProcessorNode = processorNodes[processorNodes.length - 1] as Node;
      calculateExportersNode(exporterNodes, lastProcessorNode);
  
    calculateProcessorNode(processorNodes);
    calculateReceiverNode(receiverNodes, firstProcessorNode);
  };
  useEffect(() => {
    if (!Array.isArray(nodeIdsArray) || nodeIdsArray.length < 2) {
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