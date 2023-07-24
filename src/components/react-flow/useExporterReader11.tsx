import { useState, useEffect } from 'react';
import { Node, ReactFlowInstance } from 'reactflow';
import { IConfig } from './mockData';

const useExporterReader = (configFile: IConfig[], reactFlowInstance: ReactFlowInstance) => {
  // const reactFlowInstance = useReactFlow();
  const [jsonData, setJsonData] = useState<Node[]>([
    
  ]);

  useEffect(() => {
    const updatedJsonData: Node[] = [];
    let nodeId = 98765;

    configFile.forEach((file) => {
      if (file.service.pipelines.logs.exporters) {
        file.service.pipelines.logs.exporters.forEach((exporter) => {
          reactFlowInstance.addNodes({
            id: `${++nodeId}`,
            position: { x: Math.random() * 100,
              y: Math.random() * 100, },
            data: { label: exporter },
            type: "exporterNode",
          });
          
        });
      }

      if (file.service.pipelines.logs.processors) {
        file.service.pipelines.logs.processors.forEach((processor) => {
          reactFlowInstance.addNodes({
            id: `${++nodeId}`,
            position: { x: Math.random() * 100,
              y: Math.random() * 100, },
            data: { label: processor },
            type: "processorNode",
          });
        });
      }

      if (file.service.pipelines.logs.receivers) {
        file.service.pipelines.logs.receivers.forEach((receiver) => {
          reactFlowInstance.addNodes({
            id: `${++nodeId}`,
            position: { x: Math.random() * 100,
              y: Math.random() * 100, },
            data: { label: receiver },
            type: "receiverNode",
          });
        });
      }
      
    });

    setJsonData(updatedJsonData);
  }, []);

  // Return just the jsonData array without wrapping it in an object
  return jsonData;
};

export default useExporterReader;