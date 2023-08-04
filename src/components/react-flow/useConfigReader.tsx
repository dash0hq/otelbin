import type { Node, ReactFlowInstance } from "reactflow";
import type { IConfig, ILog, IMetrics, IPipeline, ITraces } from "./mockData";
import { useEffect, useState } from "react";
import { uuid } from "uuidv4";

const addPipleType = (pipelines: IPipeline): Node[] => {
  const nodesToAdd: Node[] = [];

  const calculateMaxHeight = (data: IPipeline): number => {
    const heights = Object.values(data).map(pipeline => {
      const receiversLength = pipeline.receivers.length;
      const exportersLength = pipeline.exporters.length;
      return Math.max(receiversLength, exportersLength);
    });
    return Math.max(...heights) * 200;
  };

  const calculateHeight = (index: number): number => {
    if (index === 1) {
      return 100;
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
        data: { label: key },
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


const addToLogs = (log: ILog) => {
  const nodesToAdd: Node[] = [];
   const receiversLength = log.receivers?.length
  const exportersLength = log.exporters?.length
  const compareLength = receiversLength > exportersLength ? receiversLength : exportersLength
  const parentHeight = (compareLength * 80) / 2;
  const offsetX = 200;
  const keyLogs = Object.keys(log);

   
    
  keyLogs.map((logItem, index) => {
    if (logItem === "processors") {
      const processors = log.processors;
      processors.forEach((processor, index) => {
        nodesToAdd.push({
          id: `Logs-Processor-processorNode-${processor}-${uuid().slice(0, 6)}}}`,
          parentNode: 'logs',
          extent: 'parent',
          type: 'processorsNode',
          position: { x: (index + 1) * offsetX, y: parentHeight }, 
          data: { label: processor },
          draggable: false,
        });
      });
    }
    if (logItem === "receivers") {
      const plusIndex = index + 0.3;
      const receivers = log.receivers;
      receivers.map((receiver, index) => {
        nodesToAdd.push({
          id: `Logs-Receiver-receiverNode-${receiver}-${uuid().slice(0, 4)}`,
          parentNode: 'logs',
          extent: 'parent',
          type: 'receiversNode',
          position: { x: plusIndex * offsetX, y: calculateValue(parentHeight, index)}, 
          data: { label: receiver },
          draggable: false,
        });
      });
    }
    if (logItem === "exporters") {
      const exporters = log.exporters;
      exporters.map((exporter, index) => {
        nodesToAdd.push({
          id: `Logs-exporter-exporterNode-${exporter}-${uuid().slice(0, 4)}`,
          parentNode: 'logs',
          extent: 'parent',
          type: 'exportersNode',
          position: { x: (log.processors.length  * offsetX + offsetX), y: calculateValue(parentHeight, index) }, 
          data: { label: exporter },
          draggable: false,
        });
      });
    }
})
  return nodesToAdd;
}
const addToMetrics = (metric: IMetrics) => {
  const nodesToAdd: Node[] = [];
  const receiversLength = metric.receivers?.length
  const exportersLength = metric.exporters?.length
  const compareLength = receiversLength > exportersLength ? receiversLength : exportersLength
  const parentHeight = (compareLength * 80) / 2;
  const offsetX = 200;
  const keyMetrics = Object.keys(metric);
  keyMetrics.map((metricItem, index) => {
    if (metricItem === "processors") {
      const processors = metric.processors;
      processors.forEach((processor, index) => {
        nodesToAdd.push({
          id: `Metrics-Processor-processorNode-${processor}-${uuid().slice(0, 4)}`,
          parentNode: 'metrics',
          extent: 'parent',
          type: 'processorsNode',
          position: { x: (index + 1) * offsetX, y: parentHeight }, 
          data: { label: processor },
          draggable: false,
        });
      });
    }
    if (metricItem === "receivers") {
      const plusIndex = index + 0.3;
      const receivers = metric.receivers;
      receivers.map((receiver, index) => {
        nodesToAdd.push({
          id: `Metrics-Receiver-receiverNode-${receiver}-${uuid().slice(0, 4)}`,
          parentNode: 'metrics',
          extent: 'parent',
          type: 'receiversNode',
          position: { x: plusIndex * offsetX, y: calculateValue(parentHeight, index) }, 
          data: { label: receiver },
          draggable: false,
        });
      });
    }
    if (metricItem === "exporters") {
      const exporters = metric.exporters;
      exporters.map((exporter, index) => {
        nodesToAdd.push({
          id: `Metrics-exporter-exporterNode-${exporter}-${uuid().slice(0, 4)}`,
          parentNode: 'metrics',
          extent: 'parent',
          type: 'exportersNode',
          position: { x: (metric.processors.length  * offsetX + offsetX), y: calculateValue(parentHeight, index) }, 
          data: { label: exporter },
        });
      });
    }
})
  return nodesToAdd;
}
const addToTraces = (trace: ITraces) => {
  const nodesToAdd: Node[] = [];
  const receiversLength = trace.receivers?.length
  const exportersLength = trace.exporters?.length
  const compareLength = receiversLength > exportersLength ? receiversLength : exportersLength
  const parentHeight = (compareLength * 80) / 2;
  const offsetX = 200;
  const keyTraces = Object.keys(trace);

  keyTraces.map((traceItem, index) => {
    if (traceItem === "processors") {
      const processors = trace.processors;
      processors.forEach((processor, index) => {
        nodesToAdd.push({
          id: `Traces-Processor-processorNode-${processor}-${uuid().slice(0, 4)}`,
          parentNode: 'traces',
          extent: 'parent',
          type: 'processorsNode',
          position: { x: (index + 1) * offsetX, y: parentHeight }, 
          data: { label: processor },
          draggable: false,
        });
      });
    }
    if (traceItem === "receivers") {
      const plusIndex = index + 0.3;
      const receivers = trace.receivers;
      receivers.map((receiver, index) => {
        nodesToAdd.push({
          id: `Traces-Receiver-receiverNode-${receiver}-${uuid().slice(0, 4)}`,
          parentNode: 'traces',
          extent: 'parent',
          type: 'receiversNode',
          position: { x: plusIndex * offsetX, y: calculateValue(parentHeight, index) }, 
          data: { label: receiver },
          draggable: false,
        });
      });
    }
    if (traceItem === "exporters") {
      const exporters = trace.exporters;
      exporters.map((exporter, index) => {
        nodesToAdd.push({
          id: `Traces-exporter-exporterNode-${exporter}-${uuid().slice(0, 4)}`,
          parentNode: 'traces',
          extent: 'parent',
          type: 'exportersNode',
          position: { x: (trace.processors.length  * offsetX + offsetX), y: calculateValue(parentHeight, index) }, 
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
    const logs = value?.service?.pipelines?.logs ?? [];
    const metrics = value?.service?.pipelines?.metrics ?? [];
    const traces = value?.service?.pipelines?.traces ?? [];
    const pipelines = value?.service?.pipelines;

    const nodesToAdd: Node[] = [];

    nodesToAdd.push(...addPipleType(pipelines));
    nodesToAdd.push(...addToLogs(logs));
    nodesToAdd.push(...addToMetrics(metrics));
    nodesToAdd.push(...addToTraces(traces));
    

    setJsonDataState(nodesToAdd);
  }, [value, reactFlowInstance]);
  return jsonDataState;
};

export default useConfigReader;
