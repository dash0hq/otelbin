import { useNodes, type Node, type ReactFlowInstance } from "reactflow";
import type { IConfig, IParentNode, IPipeline } from "./dataType";
import { useEffect, useState } from "react";
import { v4 } from "uuid";


const addPipleType = (pipelines: IPipeline, parentValue: Node[]): Node[] => {
  const nodesToAdd: Node[] = [];
  
  if (pipelines) {
    const pipelineKeys = Object.keys(pipelines);

    pipelineKeys.map((key, index) => {
     const parentYposition = parentValue.find(node => node.id === key);
     console.log(parentYposition)
      nodesToAdd.push({
        id: key,
        type: 'parentNodeType',
        position: { x: 0, y:0  },
        data: { label: key, parentNode: key },
        draggable: false,
      });
      console.log(nodesToAdd.map(m => m.position))
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
          data: { label: processor, parentNode: parentLable, type: 'processors' },
          draggable: false,
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
          position, 
          data: { label: receiver, parentNode: parentLable, type: 'receivers' },
          draggable: false,
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
          position, 
          data: { label: exporter, parentNode: parentLable, type: 'exporters' },
          draggable: false,
        });
      });
    }
  })
  return nodesToAdd;
}

const useConfigReader = (value: IConfig, reactFlowInstance :ReactFlowInstance) => {
  const [jsonDataState, setJsonDataState] = useState<Node[]>([]);
  const nodes = useNodes();
  const parentNodesValue = nodes.filter(node => node.type === 'parentNodeType');
  
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

    nodesToAdd.push(...addPipleType(pipelines, parentNodesValue));
    parentNodeLabels.forEach((node) => {
      const childNodes = getArrayByName(node);
      nodesToAdd.push(...createNode(node, childNodes, pipelines));
    })
    

    setJsonDataState(nodesToAdd);
  }, [value, reactFlowInstance]);
  return jsonDataState;
};

export default useConfigReader;
