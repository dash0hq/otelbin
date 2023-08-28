import { useNodes, type Node, type ReactFlowInstance, XYPosition } from "reactflow";
import type { IConfig, IParentNode, IPipeline } from "./dataType";
import { useEffect, useState } from "react";
import { v4 } from "uuid";


const createNode = (parentLable: string, parentNode: IParentNode | null, pipelines: IPipeline, nodes: Node[]) => {
  const nodesToAdd: Node[] = [];
  const keyTraces = Object.keys(parentNode!);
  
  const children = nodes.filter(child => child.parentNode === parentLable);
  const receivers = children.filter(child => child.type === 'receiversNode').length;
  const exporters = children.filter(child => child.type === 'exportersNode').length;
  const max = Math.max(receivers, exporters);
  const parentHeight = max * 100;

  const calculateValue = (parentHeight: number, index: number): number => {
    const offset = 60;
    let value = parentHeight / 2;
    if (index === 0) {
      return value =+ value + offset;
    }
    if (index % 2 !== 0) {
      return value =+ value - offset * index;
    } else {
      return value =+ value + offset * index;
    }
  };


  const calculateReceiverYposition = (receivers: string[], index: number, parentHeight: number) => {
    if (receivers.length === 0) return;
    if (receivers.length === 1) {
      return parentHeight / 2;
    } else {
      // #1 calculate parent height
      // #2 adding correct parent height, 
      const x = calculateValue(parentHeight, index)
      if (x)
      return x;
    }
  };
  


const processorPosition = (index: number, parentHeight: number, receivers: string[]): XYPosition => {
  const receiverLength = receivers.length ? 250 : 0;
  return { x: receiverLength + index * 200 , y: parentHeight / 2 };
}
  
const receiverPosition = (index: number, parentHeight: number, receivers: string[]): XYPosition => {
  const positionY = calculateReceiverYposition(receivers, index, parentHeight)!;
  return { x: 60, y: positionY };
}

const exporterPosition = (index: number, parentHeight: number, exporters: string[], processors: string[]): XYPosition => {
  const positionY = calculateReceiverYposition(exporters, index, parentHeight)!;
  const processorLength = processors.length * 150 + 350;
  return { x: processorLength , y: positionY };
}

  keyTraces.map((traceItem) => {
    if (traceItem === "processors") {
      const processors = parentNode!.processors;
      Array.isArray(processors) && processors.length > 0 && processors.map((processor, index) => {
        nodesToAdd.push({
          id: `${parentLable}-Processor-processorNode-${processor}-${v4()}`,
          parentNode: parentLable,
          extent: 'parent',
          type: 'processorsNode',
          position: processorPosition(index, parentHeight, processors), 
          data: { label: processor, parentNode: parentLable, type: 'processors', height: 80 },
          draggable: false,
        });
      });
    }
    if (traceItem === "receivers") {
      const receivers = parentNode!.receivers;
      Array.isArray(receivers) && receivers.length > 0 && receivers.map((receiver, index) => {
        nodesToAdd.push({
          id: `${parentLable}-Receiver-receiverNode-${receiver}-${v4()}`,
          parentNode: parentLable,
          extent: 'parent',
          type: 'receiversNode',
          position: receiverPosition(index, parentHeight, receivers), 
          data: { label: receiver, parentNode: parentLable, type: 'receivers', height: 80 },
          draggable: false,
        });
      });
    }
    if (traceItem === "exporters") {
      const exporters = parentNode!.exporters;
      const processors = parentNode!.processors;
      exporters?.map((exporter, index) => {
        nodesToAdd.push({
          id: `${parentLable}-exporter-exporterNode-${exporter}-${v4()}`,
          parentNode: parentLable,
          extent: 'parent',
          type: 'exportersNode',
          position: exporterPosition(index, parentHeight, exporters, processors),
          data: { label: exporter, parentNode: parentLable, type: 'exporters', height: 80 },
          draggable: false,
        });
      });
    }
  })
  return nodesToAdd;
}

const useConfigReader = (value: IConfig, reactFlowInstance: ReactFlowInstance) => {
  const [jsonDataState, setJsonDataState] = useState<Node[]>([]);
  const nodes = useNodes();

  useEffect(() => {
    const parentNodeLabels = Object.keys(value?.service?.pipelines ?? {});
    const pipelines = value?.service?.pipelines;

    const nodesToAdd: Node[] = [];

    parentNodeLabels.forEach((parentNodeLabel, index) => {
      const parentNode = pipelines[parentNodeLabel];
      const parentNodeId = parentNodeLabel;

      nodesToAdd.push({
        id: parentNodeId,
        type: 'parentNodeType',
        position: { x: 0, y: index * 500 },
        data: { label: parentNodeLabel, parentNode: parentNodeLabel },
        draggable: false,
        ariaLabel: parentNodeLabel,
        expandParent: true,
      });
      const childNodes = createNode(parentNodeId, parentNode, pipelines, nodes);
      nodesToAdd.push(...childNodes);
    });
    setJsonDataState(nodesToAdd);
  }, [value, reactFlowInstance]);

  return jsonDataState;
};

export default useConfigReader;
