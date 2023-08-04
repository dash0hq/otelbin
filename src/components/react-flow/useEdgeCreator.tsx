import { useEffect, useState } from 'react';
import { MarkerType, type Edge, type Node, ReactFlowInstance } from 'reactflow';

function useEdgeCreator(nodeIdsArray: Node[], reactFlowInstance: ReactFlowInstance) {
  const [edgeList, setEdgeList] = useState<Edge[]>([]);
  useEffect(() => {
  const edgesToAdd: Edge[] = [];

  const calculateExportersNode = (exportersNodes: Node[], processorsNode: Node) => {
    exportersNodes.forEach((targetNode) => {
      if (!processorsNode || !targetNode) {
        return;
      }
      const sourceNodeId = processorsNode.id;
      const targetNodeId = targetNode.id;
      const edgeId = `edge-${sourceNodeId}-${targetNodeId}`;
      const edge: Edge = {
        id: edgeId,
        source: sourceNodeId,
        target: targetNodeId,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#fff',
          width: 30,
          height: 30,
        },
      };
      edgesToAdd.push(edge);
    });
  };
  const calculateprocessorsNode = (processorsNodes: Node[]) => {
    for (let i = 0; i < processorsNodes.length - 1; i++) {
      const sourceNode = processorsNodes[i];
      const targetNode = processorsNodes[i + 1];
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
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#fff',
          width: 30,
          height: 30,
        },
      };
      edgesToAdd.push(edge);
    }
  };
  const calculatereceiversNode = (receiversNodes: Node[], firstprocessorsNode: Node) => {
    receiversNodes.forEach((sourceNode) => {
      if (!receiversNodes || !sourceNode) {
        return;
      }
      const sourceNodeId = sourceNode.id;
      const targetNodeId = firstprocessorsNode.id;
      const edgeId = `edge-${sourceNodeId}-${targetNodeId}`;
      const edge: Edge = {
        id: edgeId,
        source: sourceNodeId,
        target: targetNodeId,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#fff',
          width: 30,
          height: 30,
        },
      };
      edgesToAdd.push(edge);
    });
  };
  
  const addToLogs = (nodeLogs: Node[]) => {
    const exportersNodes = nodeLogs.filter((node) => node.type === 'exportersNode');
    const processorsNodes = nodeLogs.filter((node) => node.type === 'processorsNode');
    const receiversNodes = nodeLogs.filter((node) => node.type === 'receiversNode');
    const firstprocessorsNode = processorsNodes[0] as Node;
      const lastprocessorsNode = processorsNodes[processorsNodes.length - 1] as Node;
      calculateExportersNode(exportersNodes, lastprocessorsNode);
  
    calculateprocessorsNode(processorsNodes);
    calculatereceiversNode(receiversNodes, firstprocessorsNode);
  };
  const addToMetrics = (nodeMetrics: Node[]) => {
    const exportersNodes = nodeMetrics.filter((node) => node.type === 'exportersNode');
    const processorsNodes = nodeMetrics.filter((node) => node.type === 'processorsNode');
    const receiversNodes = nodeMetrics.filter((node) => node.type === 'receiversNode');
    const firstprocessorsNode = processorsNodes[0] as Node;
      const lastprocessorsNode = processorsNodes[processorsNodes.length - 1] as Node;
      calculateExportersNode(exportersNodes, lastprocessorsNode);
  
    calculateprocessorsNode(processorsNodes);
    calculatereceiversNode(receiversNodes, firstprocessorsNode);
  };
  const addToTraces = (nodeTraces: Node[]) => {
    const exportersNodes = nodeTraces.filter((node) => node.type === 'exportersNode');
    const processorsNodes = nodeTraces.filter((node) => node.type === 'processorsNode');
    const receiversNodes = nodeTraces.filter((node) => node.type === 'receiversNode');
    const firstprocessorsNode = processorsNodes[0] as Node;
      const lastprocessorsNode = processorsNodes[processorsNodes.length - 1] as Node;
      calculateExportersNode(exportersNodes, lastprocessorsNode);
  
    calculateprocessorsNode(processorsNodes);
    calculatereceiversNode(receiversNodes, firstprocessorsNode);
  };

    const nodeLogs = nodeIdsArray.filter((node) => node.parentNode === 'logs');
    const nodeMetrics = nodeIdsArray.filter((node) => node.parentNode === 'metrics');
    const nodeTraces = nodeIdsArray.filter((node) => node.parentNode === 'traces');
    
    if (!Array.isArray(nodeIdsArray) || nodeIdsArray.length < 2) {
      return;
    }

    addToLogs(nodeLogs)
    addToMetrics(nodeMetrics)
    addToTraces(nodeTraces)

    setEdgeList(edgesToAdd);
  }, [nodeIdsArray, reactFlowInstance]);

  return edgeList;
}

export default useEdgeCreator;