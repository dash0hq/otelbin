import { useEffect, useState } from 'react';
import { MarkerType, type Edge, type Node, type ReactFlowInstance } from 'reactflow';

function useEdgeCreator(nodeIdsArray: Node[], reactFlowInstance: ReactFlowInstance) {
  const [edgeList, setEdgeList] = useState<Edge[]>([]);
  useEffect(() => {
  const edgesToAdd: Edge[] = [];

    const calculateColor = (index: number): string => {
      switch (index) {
        case 0:
          return '#F59E0B';
        case 1:
          return '#0AA8FF';
        case 2:
          return '#40ad54';
        case 3:
          return '#911dc9';
      }
      return '#FFC542';
    };

  const calculateExportersNode = (exportersNodes: Node[], processorsNode: Node, index: number) => {
    exportersNodes.forEach((targetNode) => {
      if (!processorsNode || !targetNode) {
        return;
      }
      const sourceNodeId = processorsNode.id;
      const targetNodeId = targetNode.id;
      const edgeId = `edge-${sourceNodeId}-${targetNodeId}`;
      const edge: Edge = {
        id: edgeId,
        source: sourceNodeId!,
        target: targetNodeId,
        markerEnd: {
          type: MarkerType.Arrow,
          color: calculateColor(index),
          width: 30,
          height: 30,
        },
        style: {
          stroke: calculateColor(index),
        }
      };
      edgesToAdd.push(edge);
    });
  };
  const calculateProcessorsNode = (processorsNodes: Node[], index: number) => {
    for (let i = 0; i < processorsNodes.length; i++) {
      const sourceNode = processorsNodes[i];
      const targetNode =  processorsNodes[i + 1];
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
          type: MarkerType.Arrow,
          color: calculateColor(index),
          width: 30,
          height: 30,
        },
        style: {
          stroke: calculateColor(index),
        }
      };
      edgesToAdd.push(edge);
    }
  };

  const calculateReceiversNode = (receiversNodes: Node[], firstprocessorsNode: Node | undefined, exportersNodes: Node[], index: number) => {
    if (!firstprocessorsNode) {
      receiversNodes.forEach((sourceNode) => {
        if (!sourceNode) {
          return;
        }
  
        const sourceNodeId = sourceNode.id;
  
        exportersNodes.forEach((exporterNode) => {
          if (!exporterNode) {
            return;
          }
  
          const targetNodeId = exporterNode.id;
          const edgeId = `edge-${sourceNodeId}-${targetNodeId}`;
          const edge: Edge = {
            id: edgeId,
            source: sourceNodeId,
            target: targetNodeId,
            markerEnd: {
              type: MarkerType.Arrow,
              color: calculateColor(index),
              width: 30,
              height: 30,
            },
            style: {
              stroke: calculateColor(index),
            }
          };
          edgesToAdd.push(edge);
        });
      });
    } else {
      receiversNodes.forEach((sourceNode) => {
        if (!sourceNode) {
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
            type: MarkerType.Arrow,
            color: calculateColor(index),
            width: 30,
            height: 30,
          },
          style: {
            stroke: calculateColor(index),
          }
        };
        edgesToAdd.push(edge);
      });
    }
  };
  
  
  const addEdgesToNodes = (nodes: Node[], index: number) => {
    const exportersNodes = nodes.filter((node) => node.type === 'exportersNode');
    const processorsNodes = nodes.filter((node) => node.type === 'processorsNode');
    const receiversNodes = nodes.filter((node) => node.type === 'receiversNode');
    const firstprocessorsNode = processorsNodes[0] as Node;
    const lastprocessorsNode = processorsNodes[processorsNodes.length - 1] as Node;

      calculateExportersNode(exportersNodes, lastprocessorsNode, index);
      calculateProcessorsNode(processorsNodes, index);
      calculateReceiversNode(receiversNodes, firstprocessorsNode, exportersNodes, index);
  };

    const childNodes = (parentNode: string) => {
        const eachParentNode = nodeIdsArray.filter((node) => node.parentNode === parentNode);
        return eachParentNode;
    }

    const parentNodes = nodeIdsArray.filter((node) => node.type === 'parentNodeType').map((node) => node.data.label); 
    // think about here < 2?
    if (!Array.isArray(nodeIdsArray) || nodeIdsArray.length < 2) {
      return;
    }

    parentNodes.forEach((parentNode, index) => {
      console.log(parentNode)
      const childNode = childNodes(parentNode);
      addEdgesToNodes(childNode, index)
    });

    setEdgeList(edgesToAdd);
  }, [nodeIdsArray, reactFlowInstance]);

  return edgeList;
}

export default useEdgeCreator;