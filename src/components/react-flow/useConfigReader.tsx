import { Position, type Node, type ReactFlowInstance } from "reactflow";
import type { IConfig, IParentNode, IPipeline1 } from "./dataType";
import { useEffect, useState } from "react";
import { v4 } from "uuid";

const addPipleType = (pipelines: IPipeline1): Node[] => {
  const nodesToAdd: Node[] = [];
  const isHorizantal = true;
  
  if (pipelines) {
    const pipelineKeys = Object.keys(pipelines);

    pipelineKeys.forEach((key, index) => {
      nodesToAdd.push({
        id: key,
        type: 'parentNodeType',
        position: {x: 0, y: 0},
        data: { label: key, parentNode: key },
        draggable: true,
        style: {
          // width: isHorizantal ? width : calculateMaxHeight(pipelines) * 100,
          padding: "4px 12px 10px 4px",
          // height: isHorizantal ? calculateMaxHeight(pipelines) * 200 : width * 100,
          // backgroundColor: "#fff",
          // border: 'red 1px solid',
          // borderRadius: "10px",
          // fontSize: "10px",
          // marginBottom: "10px",
        },
      });
      console.log(nodesToAdd.map(node => node))
    });
  }

  return nodesToAdd;
};

const createNode = (parentLable: string, parentNode: IParentNode | null, pipelines: IPipeline1) => {
  const nodesToAdd: Node[] = [];
  const offsetX = 200;
  const position= {x: 0, y: 0};
  const keyTraces = Object.keys(parentNode!);

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
          width: 80,
          height: 80,
        });
      });
    }
    if (traceItem === "receivers") {
      const plusIndex = index + 0.3;
      const receivers = parentNode!.receivers;
      receivers.map((receiver, index) => {
        nodesToAdd.push({
          id: `${parentLable}-Receiver-receiverNode-${receiver}-${v4()}`,
          parentNode: parentLable,
          extent: 'parent',
          type: 'receiversNode',
          position, 
          data: { label: receiver, parentNode: parentLable, type: 'receivers' },
          draggable: false,
          width: 80,
          height: 80,
        });
      });
    }
    if (traceItem === "exporters") {
      const exporters = parentNode!.exporters;
      exporters.map((exporter, index) => {
        nodesToAdd.push({
          id: `${parentLable}-exporter-exporterNode-${exporter}-${v4()}`,
          parentNode: parentLable,
          extent: 'parent',
          type: 'exportersNode',
          position, 
          data: { label: exporter, parentNode: parentLable, type: 'exporters' },
          draggable: false,
          width: 80,
          height: 80,
        });
      });
    }
  })
  return nodesToAdd;
}

const useConfigReader = (value: IConfig, reactFlowInstance :ReactFlowInstance, width: number, height: number) => {
  const [jsonDataState, setJsonDataState] = useState<Node[]>([]);

  
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
