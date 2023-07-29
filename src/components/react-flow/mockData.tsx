export const data: IConfig[] = [
  {
    "service": {
        "pipelines": {
            "logs": {
                "exporters": [
                    "otl/resourceExtractor"
                ],
                "processors": [
                    "memory_limiter",
                    "resourc/defaultDataset",
                    "batch"
                ],
                "receivers": [
                    "otlp"
                ]
            },
            "metrics": {
                "exporters": [
                    "otl/resourceExtractor",
                    "prometheu/metricsStore"
                ],
                "processors": [
                    "memory_limiter",
                    "filte/dropNilValues",
                    "transfor/fixMetricDescriptions",
                    "resourc/defaultDataset",
                    "batch"
                ],
                "receivers": [
                    "otlp"
                ]
            },
            "traces": {
                "exporters": [
                    "loadbalancin/traceProcessor"
                ],
                "processors": [
                    "memory_limiter",
                    "resourc/defaultDataset",
                    "batch"
                ],
                "receivers": [
                    "otlp"
                ]
            }
        },
    }
}
];

export interface Node {
    id: string;
    position: { x: number; y: number };
    data: { label: string };
    type?: string;
  }
  
  export interface ILog {
      exporters: string[];
      processors: string[];
      receivers: string[];
  }
  export interface IMetrics {
      exporters: string[];
      processors: string[];
      receivers: string[];
  }
  export interface ITraces {
      exporters: string[];
      processors: string[];
      receivers: string[];
  }
  export  interface IPipeline {
    logs: ILog;
    metrics: IMetrics;
    traces: ITraces;
  }
  interface IService {
    pipelines: IPipeline;
  }
 export interface IConfig {
    [key: string]: any;
  service: IService; 
  }