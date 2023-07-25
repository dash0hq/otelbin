import { useState, useEffect } from 'react';
import { Edge, Node, ReactFlowInstance } from 'reactflow';
import { IConfig, IPipeline } from './mockData';
import { uuid } from 'uuidv4';

const addPipleType = (pipelines: IPipeline, reactFlowInstance: ReactFlowInstance) => {
  if (pipelines.logs) {
      reactFlowInstance.addNodes({
        id: `logs`,
        type: 'group',
        position: { x: 100, y: 0 },
        data: { label: 'Logs' },
        style: {
          width: 1570,
          height: 239,
        },
      });
  }
  if (pipelines.metrics) {
      reactFlowInstance.addNodes({
        id: `metrics`,
        type: 'group',
        position: { x: 100, y: 300 },
        data: { label: 'Metrics' },
        style: {
          width: 1570,
          height: 239,
        },
      });
  }
  if (pipelines.traces) {
      reactFlowInstance.addNodes({
        id: `traces`,
        type: 'group',
        position: { x: 100, y: 600 },
        data: { label: 'Traces' },
        style: {
          width: 1570,
          height: 239,
        },
      });
  }
}

const addNodesForType = (nodes: string[], type: string, reactFlowInstance: ReactFlowInstance, pipelineType: string) => {
  if (nodes) {
    nodes.forEach((node) => {
      reactFlowInstance.addNodes({
        id: uuid(),
        // id: `${pipelineType}+${node}+${type}Node`,
        position: { x: Math.random() + 500, y:  100 },
        data: { label: node },
        type: `${type}Node`,
        parentNode: pipelineType === "log" ? "logs" :
        pipelineType === "metrics" ? "metrics" :
        pipelineType === "traces" ? "traces" :
        "",
        extent: 'parent',
      });
    });
  }
};


const useExporterReader = (configFile: IConfig[], reactFlowInstance: ReactFlowInstance) => {
  const [jsonData, setJsonData] = useState<Node[]>([]);
  console.log(jsonData)
  useEffect(() => {
    const updatedJsonData: Node[] = [];

    configFile.forEach((file) => {
      const { logs, metrics, traces } = file.service.pipelines;
      const { pipelines} = file.service;
      addPipleType(pipelines, reactFlowInstance);
      // Process logs exporters, processors, and receivers
      addNodesForType(logs.exporters, 'exporter', reactFlowInstance, "log");
      addNodesForType(logs.processors, 'processor', reactFlowInstance, "log");
      addNodesForType(logs.receivers, 'receiver', reactFlowInstance, "log");

      // Process metrics exporters, processors, and receivers
      addNodesForType(metrics.exporters, 'exporter', reactFlowInstance, "metrics");
      addNodesForType(metrics.processors, 'processor', reactFlowInstance, "metrics");
      addNodesForType(metrics.receivers, 'receiver', reactFlowInstance, "metrics");

      // // // Process traces exporters, processors, and receivers
      addNodesForType(traces.exporters, 'exporter', reactFlowInstance, "traces");
      addNodesForType(traces.processors, 'processor', reactFlowInstance, "traces");
      addNodesForType(traces.receivers, 'receiver', reactFlowInstance, "traces");
    });

    setJsonData(updatedJsonData);
  }, []);

  // Return just the jsonData array without wrapping it in an object
  return jsonData;
};

export default useExporterReader;