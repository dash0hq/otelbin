import { useState, useEffect } from 'react';
import { Node, ReactFlowInstance } from 'reactflow';
import { IConfig, IPipeline } from './mockData';

const addPipleType = (pipelines: IPipeline, reactFlowInstance: ReactFlowInstance) => {
  if (pipelines.logs) {
      reactFlowInstance.addNodes({
        id: `pipline+logs`,
        type: 'group',
        position: { x: Math.random() * 10, y: Math.random() * 10 },
        data: { label: 'Logs' },
        style: {
          width: 1570,
          height: 239,
        },
      });
  }
  if (pipelines.metrics) {
      reactFlowInstance.addNodes({
        id: `pipline+metrics`,
        type: 'group',
        position: { x: Math.random() * 10, y: Math.random() * 10 },
        data: { label: 'Metrics' },
        style: {
          width: 1570,
          height: 239,
        },
      });
  }
  if (pipelines.traces) {
      reactFlowInstance.addNodes({
        id: `pipline+traces`,
        type: 'group',
        position: { x: Math.random() * 10, y: Math.random() * 10 },
        data: { label: 'Traces' },
        style: {
          width: 1570,
          height: 239,
        },
      });
  }
}

const addNodesForType = (nodes: string[], type: string, nodeId: number, reactFlowInstance: ReactFlowInstance, pipelineType: string) => {
  if (nodes) {
    nodes.forEach((node) => {
      reactFlowInstance.addNodes({
        id: `${pipelineType}+${node}+${type}Node`,
        position: { x: Math.random() * 100, y: Math.random() * 100 },
        data: { label: node },
        type: `${type}Node`,
        parentNode: pipelineType === "log" ? "pipline+logs" :
        pipelineType === "metrics" ? "pipline+metrics" :
        pipelineType === "traces" ? "pipline+traces" :
        "",
        extent: 'parent',
      });
    });
  }
};

const useExporterReader = (configFile: IConfig[], reactFlowInstance: ReactFlowInstance) => {
  // const reactFlowInstance = useReactFlow();
  const [jsonData, setJsonData] = useState<Node[]>([
    
  ]);

  
  useEffect(() => {
    const updatedJsonData: Node[] = [];
    const nodeId = Math.random() * 100;

    configFile.forEach((file) => {
      const { logs, metrics, traces } = file.service.pipelines;
      const { pipelines} = file.service;
      addPipleType(pipelines, reactFlowInstance);
      // Process logs exporters, processors, and receivers
      addNodesForType(logs.exporters, 'exporter', nodeId, reactFlowInstance, "log");
      addNodesForType(logs.processors, 'processor', nodeId, reactFlowInstance, "log");
      addNodesForType(logs.receivers, 'receiver', nodeId, reactFlowInstance, "log");

      // Process metrics exporters, processors, and receivers
      addNodesForType(metrics.exporters, 'exporter', nodeId, reactFlowInstance, "metrics");
      addNodesForType(metrics.processors, 'processor', nodeId, reactFlowInstance, "metrics");
      addNodesForType(metrics.receivers, 'receiver', nodeId, reactFlowInstance, "metrics");

      // // // Process traces exporters, processors, and receivers
      addNodesForType(traces.exporters, 'exporter', nodeId, reactFlowInstance, "traces");
      addNodesForType(traces.processors, 'processor', nodeId, reactFlowInstance, "traces");
      addNodesForType(traces.receivers, 'receiver', nodeId, reactFlowInstance, "traces");
    });

    setJsonData(updatedJsonData);
  }, []);

  // Return just the jsonData array without wrapping it in an object
  return jsonData;
};

export default useExporterReader;