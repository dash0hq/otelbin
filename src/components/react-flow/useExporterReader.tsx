import { useState, useEffect } from 'react';
import type { Node, ReactFlowInstance } from 'reactflow';
import type { IConfig, IPipeline } from './mockData';
import { uuid } from 'uuidv4';

interface IPosition {
  x: number;
  y: number;
}

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

const addNodesForType = (nodes: string[], type: string, reactFlowInstance: ReactFlowInstance, pipelineType: string, position: {x: number, y: number}) => {
  if (nodes) {
    nodes.forEach((node) => {
      reactFlowInstance.addNodes({
        id: uuid(),
        position: { x: Math.random() * position.x, y:  position.y },
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
      addNodesForType(logs.exporters, 'exporter', reactFlowInstance, "log", {x: 10, y: 10});
      addNodesForType(logs.processors, 'processor', reactFlowInstance, "log", {x: 10, y: 10});
      addNodesForType(logs.receivers, 'receiver', reactFlowInstance, "log", {x: 1000, y: 10} );

      addNodesForType(metrics.exporters, 'exporter', reactFlowInstance, "metrics", {x: 1000, y: 10});
      addNodesForType(metrics.processors, 'processor', reactFlowInstance, "metrics", {x: 1000, y: 10});
      addNodesForType(metrics.receivers, 'receiver', reactFlowInstance, "metrics", {x: 1000, y: 10});

      addNodesForType(traces.exporters, 'exporter', reactFlowInstance, "traces", {x: 1000, y: 10});
      addNodesForType(traces.processors, 'processor', reactFlowInstance, "traces", {x: 1000, y: 10});
      addNodesForType(traces.receivers, 'receiver', reactFlowInstance, "traces", {x: 1000, y: 10});
    });

    setJsonData(updatedJsonData);
  }, []);

  return jsonData;
};

export default useExporterReader;