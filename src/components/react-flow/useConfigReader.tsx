import { useNodes, type Node, type ReactFlowInstance, XYPosition } from "reactflow";
import type { IConfig, IParentNode, IPipeline } from "./dataType";
import { useEffect, useState } from "react";
import { v4 } from "uuid";


const createNode = (parentLable: string, parentNode: IParentNode | null, pipelines: IPipeline, nodes: Node[], height: number) => {
  const nodesToAdd: Node[] = [];
  const keyTraces = Object.keys(parentNode!);

  const calculateValue = (parentHeight: number, index: number): number => {
    const offset = 60;
    const value = parentHeight / 2;
    if (index === 0) {
      return value - offset;
    }
    if (index % 2 !== 0) {
      return value + offset * index;
    } else {
      return value - offset * index;
    }
  };


  const calculateReceiverYposition = (receivers: string[], index: number, parentHeight: number) => {
    if (receivers.length === 0) return;
    if (receivers.length === 1 ) {
      return parentHeight / 2;
    } else {
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
  return { x: 50, y: positionY };
}

const exporterPosition = (index: number, parentHeight: number, exporters: string[], processors: string[]): XYPosition => {
  const positionY = calculateReceiverYposition(exporters, index, parentHeight)!;
  const processorLength = processors?.length * 200 + 300;
  return { x: processorLength , y: positionY };
}

  keyTraces.map((traceItem) => {
    if (traceItem === "processors") {
      const processors = parentNode!.processors;
      Array.isArray(processors) && processors.length > 0 && processors.map((processor, index) => {
        const id = `${parentLable}-Processor-processorNode-${processor}-${v4()}`;
        nodesToAdd.push({
          id: id,
          parentNode: parentLable,
          extent: 'parent',
          type: 'processorsNode',
          position: processorPosition(index, height, processors), 
          data: { label: processor, parentNode: parentLable, type: 'processors', height: 80, id: id },
          draggable: false,
        });
      });
    }
    if (traceItem === "receivers") {
      const receivers = parentNode!.receivers;
      Array.isArray(receivers) && receivers.length > 0 && receivers.map((receiver, index) => {
        const id = `${parentLable}-Receiver-receiverNode-${receiver}-${v4()}`;
        nodesToAdd.push({
          id: id,
          parentNode: parentLable,
          extent: 'parent',
          type: 'receiversNode',
          position: receiverPosition(index, height, receivers), 
          data: { label: receiver, parentNode: parentLable, type: 'receivers', height: 80, id: id },
          draggable: false,
        });
      });
    }
    if (traceItem === "exporters") {
      const exporters = parentNode!.exporters;
      const processors = parentNode!.processors;
      exporters?.map((exporter, index) => {
        const id = `${parentLable}-exporter-exporterNode-${exporter}-${v4()}`;
        nodesToAdd.push({
          id: id,
          parentNode: parentLable,
          extent: 'parent',
          type: 'exportersNode',
          position: exporterPosition(index, height, exporters, processors),
          data: { label: exporter, parentNode: parentLable, type: 'exporters', height: 80, id: id },
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
    let yOffset = 0;

    parentNodeLabels.forEach((parentNodeLabel, index) => {
      const receivers = nodes.filter((node) => node.parentNode === parentNodeLabel).filter((node) => node.type === 'receiversNode').length;
      const exporters = nodes.filter((node) => node.parentNode === parentNodeLabel).filter((node) => node.type === 'exportersNode').length;
      const max = Math.max(receivers, exporters);
      const height = max * 100;
      const extraSpacing = 200;
      const parentNode = pipelines[parentNodeLabel];
      const parentNodeId = parentNodeLabel;

      nodesToAdd.push({
        id: parentNodeId,
        type: 'parentNodeType',
        position: { x: 0, y: yOffset},
        data: { label: parentNodeLabel, parentNode: parentNodeLabel },
        draggable: false,
        ariaLabel: parentNodeLabel,
        expandParent: true,
      });
      const childNodes = createNode(parentNodeId, parentNode, pipelines, nodes, height);
      nodesToAdd.push(...childNodes);
      yOffset += height + extraSpacing;
    });
    setJsonDataState(nodesToAdd);
  }, [value, reactFlowInstance]);

  return jsonDataState;
};

export default useConfigReader;
