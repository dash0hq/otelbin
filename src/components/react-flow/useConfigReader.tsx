import type { Node, ReactFlowInstance } from "reactflow";
import type { IConfig, ILog, IMetrics, IPipeline, ITraces } from "./mockData";
import { useEffect, useState } from "react";

const addPipleType = (pipelines: IPipeline) => {
  const nodesToAdd: Node[] = [];

  if (pipelines?.logs) {
    nodesToAdd.push({
      id: `logs`,
      type: 'parentNodeType',
      position: { x: 100, y: 0 },
      data: { label: 'Logs' },
      draggable: false,
      style: {
        width: 1570,
        height: 239,
      },
    });
  }

  if (pipelines?.metrics) {
    nodesToAdd.push({
      id: `metrics`,
      type: 'parentNodeType',
      position: { x: 100, y: 300 },
      data: { label: 'Metrics' },
      draggable: false,
      style: {
        width: 1570,
        height: 239,
      },
    });
  }

  if (pipelines?.traces) {
    nodesToAdd.push({
      id: `traces`,
      type: 'parentNodeType',
      position: { x: 100, y: 600 },
      data: { label: 'Traces' },
      draggable: false,
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
  const offsetX = 300;

  if (log?.exporters) {
    log.exporters.forEach((exporter, index) => {
      const plusIndex = index + 1;
      nodesToAdd.push({
        id: `Logs-Exporter-NodeExporter-${exporter}`,
        parentNode: 'logs',
        extent: 'parent',
        type: 'exporterNode',
        position: { x: plusIndex * 1300, y: 75 }, 
        data: { label: exporter }, 
        draggable: false,
      });
    });
  }

  if (log?.processors) {
    log.processors.forEach((processor, index) => {
      const indexUpdate = index + 1;
      nodesToAdd.push({
        id: `Logs-Processor-NodeProcessor-${processor}`,
        parentNode: 'logs',
        extent: 'parent',
        type: 'processorNode',
        position: { x: indexUpdate * offsetX, y: 80 }, 
        data: { label: processor },
        draggable: false,
      });
    });
  }

  if (log?.receivers) {
    log.receivers.forEach((receiver, index) => {
      const indexUpdate = index + 1;
      nodesToAdd.push({
        id: `Logs-Receiver-NodeReceiver-${receiver}`,
        parentNode: 'logs',
        extent: 'parent',
        type: 'receiverNode',
        position: { x: indexUpdate * 100, y: 75 }, 
        data: { label: receiver }, 
        draggable: false,
      });
    });
  }

  return nodesToAdd;
}

const addToMetrics = (metrics: IMetrics) => {
  const nodesToAdd: Node[] = [];
  const offsetX = 200;

  if (metrics?.exporters) {
    metrics.exporters.forEach((exporter, index) => {
      const plusIndex = index === 0 ? index + 10 : index + 150;
      const xUpdater = index + 1;
      nodesToAdd.push({
        id: `Metrics-Exporter-NodeExporter-${exporter}`,
        parentNode: 'metrics',
        extent: 'parent',
        type: 'exporterNode',
        position: { x: 1300 , y: plusIndex * 1 }, 
        // position: { x: xUpdater === 0 ? xUpdater * 7000 : xUpdater * 700 , y: plusIndex * 1 }, 
        data: { label: exporter },
        draggable: false,
      });
    });
  }

  if (metrics?.processors) {
    metrics.processors.forEach((processor, index) => {
      const indexUpdate = index + 1;
      nodesToAdd.push({
        id: `Metrics-Processor-NodeProcessor-${processor}`,
        parentNode: 'metrics',
        extent: 'parent',
        type: 'processorNode',
        position: { x: indexUpdate * offsetX, y: 80 }, 
        data: { label: processor }, 
        draggable: false,
      });
    });
  }

  if (metrics?.receivers) {
    metrics.receivers.forEach((receiver, index) => {
      const indexUpdate = index + 1;
      nodesToAdd.push({
        id: `Metrics-Receiver-NodeReceiver-${receiver}`,
        parentNode: 'metrics',
        extent: 'parent',
        type: 'receiverNode',
        position: { x: indexUpdate * 70, y: 75 }, 
        data: { label: receiver }, 
        draggable: false,
      });
    });
  }

  return nodesToAdd;
}
const addToTraces = (traces: ITraces) => {
  const nodesToAdd: Node[] = [];
  const offsetX = 300;

  if (traces?.exporters) {
    traces.exporters.forEach((exporter, index) => {
      const plusIndex = index + 1;
      nodesToAdd.push({
        id: `Traces-Exporter-NodeExporter-${exporter}`,
        parentNode: 'traces',
        extent: 'parent',
        type: 'exporterNode',
        position: { x: plusIndex === 1 ? plusIndex * 1300 : plusIndex * 100 , y: 75 }, 
        data: { label: exporter },
        draggable: false,
      });
    });
  }

  if (traces?.processors) {
    traces.processors.forEach((processor, index) => {
      const indexUpdate = index + 1;
      nodesToAdd.push({
        id: `Trace-Processor-NodeProcessor-${processor}`,
        parentNode: 'traces',
        extent: 'parent',
        type: 'processorNode',
        position: { x: indexUpdate * offsetX, y: 80 }, 
        data: { label: processor },
        draggable: false,
      });
    });
  }

  if (traces?.receivers) {
    traces.receivers.forEach((receiver, index) => {
      const indexUpdate = index === 0 ? index + 10 : index + 150;
      nodesToAdd.push({
        id: `Traces-Receiver-NodeReceiver-${receiver}`,
        parentNode: 'traces',
        extent: 'parent',
        type: 'receiverNode',
        position: { x: 100, y: indexUpdate * 1 }, 
        data: { label: receiver },
        draggable: false,
      });
    });
  }

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
