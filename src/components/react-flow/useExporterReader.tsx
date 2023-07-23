import { useState, useEffect } from 'react';
import { Node, ReactFlowInstance, useReactFlow } from 'reactflow';

interface IExporter {
  name: string;
  id: string;
}

interface IConfig {
  exporters: IExporter[];
  processors: { name: string; id: string }[];
  receivers: { name: string; id: string }[];
}

interface IJSON {
  id: string;
  position: { x: number; y: number };
  data: { label: string };
  type: string;
}

const useExporterReader = (configFile: IConfig[], reactFlowInstance: ReactFlowInstance) => {
  // const reactFlowInstance = useReactFlow();
  const [jsonData, setJsonData] = useState<Node[]>([
    
  ]);

  useEffect(() => {
    let updatedJsonData: Node[] = [];
    let nodeId = 98765;

    configFile.forEach((file) => {
      if (file.exporters) {
        file.exporters.forEach((exporter) => {
          reactFlowInstance.addNodes({
            id: `${++nodeId}`,
            position: { x: Math.random() * 100,
              y: Math.random() * 100, },
            data: { label: exporter.name },
            type: "exporterNode",
          });
          // updatedJsonData.push({
          //   id: `${++nodeId}`,
          //   position: { x: Math.random() * 100,
          //     y: Math.random() * 100, },
          //   data: { label: exporter.name },
          //   type: "exporterNode",
          // });
        });
      }
    });

    setJsonData(updatedJsonData);
  }, []);

  // Return just the jsonData array without wrapping it in an object
  return jsonData;
};

export default useExporterReader;