import { Node, ReactFlowInstance } from "reactflow";
import { IConfig, ILog, IMetrics, IPipeline, ITraces } from "./mockData";
import { useEffect, useState } from "react";
import { uuid } from "uuidv4";

const addPipleType = (pipelines: IPipeline) => {
  const nodesToAdd: Node[] = [];

  if (pipelines?.logs) {
    nodesToAdd.push({
      id: `logs`,
      type: 'group',
      position: { x: 100, y: 0 },
      data: { label: 'Logs' },
      draggable: true,
      style: {
        width: 1570,
        height: 239,
      },
    });
  }

  if (pipelines?.metrics) {
    nodesToAdd.push({
      id: `metrics`,
      type: 'group',
      position: { x: 100, y: 300 },
      data: { label: 'Metrics' },
      draggable: true,
      style: {
        width: 1570,
        height: 239,
      },
    });
  }

  if (pipelines?.traces) {
    nodesToAdd.push({
      id: `traces`,
      type: 'group',
      position: { x: 100, y: 600 },
      data: { label: 'Traces' },
      draggable: true,
      style: {
        width: 1570,
        height: 239,
      },
    });
  }

  return nodesToAdd;
}
const addToLogs = (log: ILog) => {
  const nodesToAdd: Node[] = [];

  if (log?.exporters) {
    log.exporters.forEach((exporter) => {
      nodesToAdd.push({
        id: `Logs-Exporter-NodeExporter-${exporter}`,
        parentNode: 'logs',
        extent: 'parent',
        type: 'exporterNode',
        position: { x: Math.random() * 100, y: 10 }, 
        data: { label: exporter }, 
        draggable: true,
      });
    });
  }

  if (log?.processors) {
    log.processors.forEach((processor) => {
      nodesToAdd.push({
        id: `Logs-Processor-NodeProcessor-${processor}`,
        parentNode: 'logs',
        extent: 'parent',
        type: 'processorNode',
        position: { x: Math.random() * 100, y: 10 }, 
        data: { label: processor },
        draggable: true,
      });
    });
  }

  if (log?.receivers) {
    log.receivers.forEach((receiver) => {
      nodesToAdd.push({
        id: `Logs-Receiver-NodeReceiver-${receiver}`,
        parentNode: 'logs',
        extent: 'parent',
        type: 'receiverNode',
        position: { x: Math.random() * 100, y: 10 }, 
        data: { label: receiver }, 
        draggable: true,
      });
    });
  }

  return nodesToAdd;
}

const addToMetrics = (metrics: IMetrics) => {
  const nodesToAdd: Node[] = [];

  if (metrics?.exporters) {
    metrics.exporters.forEach((exporter) => {
      nodesToAdd.push({
        id: `Metrics-Exporter-NodeExporter-${exporter}`,
        parentNode: 'metrics',
        extent: 'parent',
        type: 'exporterNode',
        position: { x: Math.random() * 100, y: 10 }, 
        data: { label: exporter },
        draggable: true,
      });
    });
  }

  if (metrics?.processors) {
    metrics.processors.forEach((processor) => {
      nodesToAdd.push({
        id: `Metrics-Processor-NodeProcessor-${processor}`,
        parentNode: 'metrics',
        extent: 'parent',
        type: 'processorNode',
        position: { x: Math.random() * 100, y: 10 }, 
        data: { label: processor }, 
        draggable: true,
      });
    });
  }

  if (metrics?.receivers) {
    metrics.receivers.forEach((receiver) => {
      nodesToAdd.push({
        id: `Metrics-Receiver-NodeReceiver-${receiver}`,
        parentNode: 'metrics',
        extent: 'parent',
        type: 'receiverNode',
        position: { x: Math.random() * 100, y: 10 }, 
        data: { label: receiver }, 
        draggable: true,
      });
    });
  }

  return nodesToAdd;
}
const addToTraces = (traces: ITraces) => {
  const nodesToAdd: Node[] = [];

  if (traces?.exporters) {
    traces.exporters.forEach((exporter) => {
      nodesToAdd.push({
        id: `Traces-Exporter-NodeExporter-${exporter}`,
        parentNode: 'traces',
        extent: 'parent',
        type: 'exporterNode',
        position: { x: Math.random() * 100, y: 10 }, 
        data: { label: exporter },
        draggable: true,
      });
    });
  }

  if (traces?.processors) {
    traces.processors.forEach((processor) => {
      nodesToAdd.push({
        id: `Trace-Processor-NodeProcessor-${processor}`,
        parentNode: 'traces',
        extent: 'parent',
        type: 'processorNode',
        position: { x: Math.random() * 100, y: 10 }, 
        data: { label: processor },
        draggable: true,
      });
    });
  }

  if (traces?.receivers) {
    traces.receivers.forEach((receiver) => {
      nodesToAdd.push({
        id: `Traces-Receiver-NodeReceiver-${receiver}`,
        parentNode: 'traces',
        extent: 'parent',
        type: 'receiverNode',
        position: { x: Math.random() * 100, y: 10 }, 
        data: { label: receiver },
        draggable: true,
      });
    });
  }

  return nodesToAdd;
}



const useConfigReader = (value: IConfig) => {
  const [jsonDataState, setJsonDataState] = useState<Node[]>([]);
  console.log("component Node creator");

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
  }, [value]);
console.log(jsonDataState)
  return jsonDataState;
};

export default useConfigReader;
