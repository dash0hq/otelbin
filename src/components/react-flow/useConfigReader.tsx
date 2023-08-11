import type { Node, ReactFlowInstance } from "reactflow";
import type { IConfig, IParentNode, IPipeline1 } from "./dataType";
import { useEffect, useState } from "react";
import { uuid } from "uuidv4";

const addPipleType = (pipelines: IPipeline1): Node[] => {
  const nodesToAdd: Node[] = [];

  const calculateMaxHeight = (data: IPipeline1): number => {
    const heights = Object.values(data).map(pipeline => {
      const receiversLength = pipeline.receivers.length;
      const exportersLength = pipeline.exporters.length;
      return Math.max(receiversLength, exportersLength);
    });
    return Math.max(...heights) * 200;
  };

  const calculateHeight = (index: number): number => {
    if (index === 1) {
      return 10;
    } else if (index > 1) {
      const actualHeight = calculateMaxHeight(pipelines);
      return ((actualHeight / 2) + 300) * (index - 1);
    } else {
      throw new Error("Invalid index");
    }
  };
  
  if (pipelines) {
    const pipelineKeys = Object.keys(pipelines);

    pipelineKeys.forEach((key, index) => {
      nodesToAdd.push({
        id: key,
        type: 'parentNodeType',
        position: { x: 0, y: calculateHeight(index + 1) },
        data: { label: key, parentNode: key },
        draggable: false,
        style: {
          width: 1570,
          padding: "4px 12px 10px 4px",
          height: calculateMaxHeight(pipelines),
        },
      });
    });
  }

  return nodesToAdd;
};

const calculateValue = (parentHeight: number, index: number): number => {
  if (index === 0) {
    return parentHeight;
  } else if (index % 2 === 1) {
    return parentHeight - 80 * index;
  } else {
    return parentHeight + 60 * index;
  }
};

const calculateExportersLocation = (processorLength: number, offsetX: number): number => {
    if (processorLength) {
      return processorLength * offsetX + offsetX;
    }
    return 1 * offsetX;
}

const createNode = (parentLable: string, parentNode: IParentNode | null, pipelines: IPipeline1) => {
  const nodesToAdd: Node[] = [];
  const receiversLength = parentNode!.receivers?.length
  const exportersLength = parentNode!.exporters?.length
  const compareLength = receiversLength > exportersLength ? receiversLength : exportersLength
  const parentHeight = (compareLength * 80) / 2;
  const offsetX = 200;
  const keyTraces = Object.keys(parentNode!);

  const calculateMaxHeight = (data: IPipeline1, parentLabel: string): number => {
    const targetPipeline = data[parentLabel];
    if (!targetPipeline) {
      throw new Error(`Pipeline with parent label "${parentLabel}" not found in data.`);
    }
  
    const receiversLength = targetPipeline.receivers?.length || 0;
    const exportersLength = targetPipeline.exporters?.length || 0;
    const maxNodes = Math.max(receiversLength, exportersLength) * 100;
  
    const minMaxNodes = Math.max(maxNodes, 100);
  
    return minMaxNodes;
  };

  keyTraces.map((traceItem, index) => {
    if (traceItem === "processors") {
      const processors = parentNode!.processors;
      processors.forEach((processor, index) => {
        nodesToAdd.push({
          id: `${parentLable}-Processor-processorNode-${processor}-${uuid()}`,
          parentNode: parentLable,
          extent: 'parent',
          type: 'processorsNode',
          position: { x: (index + 1) * offsetX, y: calculateMaxHeight(pipelines, parentLable) / 2 }, 
          data: { label: processor,parentNode: 'traces'  },
          draggable: false,
        });
      });
    }
    if (traceItem === "receivers") {
      const plusIndex = index + 0.3;
      const receivers = parentNode!.receivers;
      receivers.map((receiver, index) => {
        nodesToAdd.push({
          id: `${parentLable}-Receiver-receiverNode-${receiver}-${uuid()}`,
          parentNode: parentLable,
          extent: 'parent',
          type: 'receiversNode',
          position: { x: 0.2 * offsetX, y: calculateValue(calculateMaxHeight(pipelines, parentLable) / 2, index) }, 
          data: { label: receiver },
          draggable: false,
        });
      });
    }
    if (traceItem === "exporters") {
      const exporters = parentNode!.exporters;
      exporters.map((exporter, index) => {
        nodesToAdd.push({
          id: `${parentLable}-exporter-exporterNode-${exporter}-${uuid()}`,
          parentNode: parentLable,
          extent: 'parent',
          type: 'exportersNode',
          position: { x: calculateExportersLocation(parentNode!.processors?.length, offsetX), y: calculateValue(calculateMaxHeight(pipelines, parentLable) / 2, index) }, 
          data: { label: exporter },
          draggable: false,
        });
      });
    }
  })
  return nodesToAdd;
}

const useConfigReader = (value: IConfig, reactFlowInstance :ReactFlowInstance) => {
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
      const parentNode = getArrayByName(node);
      nodesToAdd.push(...createNode(node, parentNode, pipelines));
    })
    

    setJsonDataState(nodesToAdd);
  }, [value, reactFlowInstance]);
  return jsonDataState;
};

export default useConfigReader;
