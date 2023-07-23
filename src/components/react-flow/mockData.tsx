// export interface IExporter {
//     name: string;
// }
// export interface IProcessors {
//     name: string;
// }
// export interface IReceivers {
//     name: string;
// }

// export interface IData {
//     exporters?: IExporter[]
//     processors?: IProcessors[]
//     receivers?: IReceivers[]
// }
export const data: IConfig[] = [
  {
    exporters: [
      { name: "loadbalancing/traceProcessor",id: "1",  },
      {  name: "logging", id: "2", },
    ],
    processors: [
      { id: "processor1", name: "batching" },
      { id: "processor2", name: "filter/dropNilValues" },
    ],
    receivers: [
      { id: "receiver1", name: "jaeger" },
      { id: "receiver2", name: "otlp" },
    ],
  },
];

export interface Node {
    id: string;
    position: { x: number; y: number };
    data: { label: string };
    type?: string;
  }
  
 export interface IConfig {
    exporters: { name: string, id: string }[];
    processors: { name: string, id: string }[];
    receivers: { name: string, id: string }[];
  }