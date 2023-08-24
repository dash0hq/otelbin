import { useNodes, type Node, type ReactFlowInstance } from "reactflow";
import type { IConfig, IParentNode, IPipeline } from "./dataType";
import { useEffect, useState } from "react";
import { v4 } from "uuid";


const addPipleType = (pipelines: IPipeline): Node[] => {
  const nodesToAdd: Node[] = [];
  
  if (pipelines) {
    const pipelineKeys = Object.keys(pipelines);
    
    pipelineKeys.map((key) => {
      nodesToAdd.push({
        id: key,
        type: 'parentNodeType',
        position: { x: 0, y:0  },
        data: { label: key, parentNode: key},
        draggable: false,
        // expandParent: true,
        // height: 180,
        ariaLabel: key,
      });
      // console.log(nodesToAdd.map(m => m.position))
    });
  }

  return nodesToAdd;
};

const createNode = (parentLable: string, parentNode: IParentNode | null, pipelines: IPipeline) => {

  const nodesToAdd: Node[] = [];
  const keyTraces = Object.keys(parentNode!);
  const position = { x: 0, y: 0};



  keyTraces.map((traceItem, index) => {
    if (traceItem === "processors") {
      const processors = parentNode!.processors;
      processors.forEach((processor, index) => {
        nodesToAdd.push({
          id: `${parentLable}-Processor-processorNode-${processor}-${v4()}`,
          parentNode: parentLable,
          extent: 'parent',
          type: 'processorsNode',
          position, 
          ariaLabel: processor,
          data: { label: processor, parentNode: parentLable, type: 'processors', height: 80 },
          draggable: false,
          // expandParent: true,
        });
      });
    }
    if (traceItem === "receivers") {
      const plusIndex = index + 0.3;
      const receivers = parentNode!.receivers;
      Array.isArray(receivers) && receivers.length > 0 && receivers.map((receiver, index) => {
        nodesToAdd.push({
          id: `${parentLable}-Receiver-receiverNode-${receiver}-${v4()}`,
          parentNode: parentLable,
          extent: 'parent',
          type: 'receiversNode',
          ariaLabel: receiver,
          position, 
          data: { label: receiver, parentNode: parentLable, type: 'receivers', height: 80 },
          draggable: false,
          // expandParent: true,
        });
      });
    }
    if (traceItem === "exporters") {
      const exporters = parentNode!.exporters;
      exporters?.map((exporter, index) => {
        nodesToAdd.push({
          id: `${parentLable}-exporter-exporterNode-${exporter}-${v4()}`,
          parentNode: parentLable,
          extent: 'parent',
          type: 'exportersNode',
          ariaLabel: exporter,
          position, 
          data: { label: exporter, parentNode: parentLable, type: 'exporters', height: 80 },
          draggable: false,
          // expandParent: true,
        });
      });
    }
  })
  return nodesToAdd;
}

const useConfigReader = (value: IConfig, reactFlowInstance :ReactFlowInstance) => {
  const [jsonDataState, setJsonDataState] = useState<Node[]>([]);
  const nodes = useNodes();
  console.log(nodes)
  // const parentNodesValue = nodes.filter(node => node.type === 'parentNodeType');
  
  useEffect(() => {
    const parentNodeLabels = Object.keys(value?.service?.pipelines ?? {});
    const pipelines = value?.service?.pipelines;
    const getArrayByName = (objectName: string): IParentNode | null => {
      if (pipelines.hasOwnProperty(objectName)) {
        return pipelines[objectName];
      } else {
        return null;
      }
    };

    const nodesToAdd: Node[] = [];

    nodesToAdd.push(...addPipleType(pipelines));
    parentNodeLabels.forEach((node) => {
      const childNodes = getArrayByName(node);
      nodesToAdd.push(...createNode(node, childNodes, pipelines));
    })
    

    setJsonDataState(nodesToAdd);
  }, [value, reactFlowInstance]);
  return jsonDataState;
};

export default useConfigReader;
