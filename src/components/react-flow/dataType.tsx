export interface INode {
    id: string;
    position: { x: number; y: number };
    data: { label: string };
    type?: string;
  }
  
  export interface IParentNode {
      exporters: string[];
      processors: string[];
      receivers: string[];
  }

  export  interface IPipeline1 {
    [key: string]: any;
    parentNode: IParentNode;
  }
  interface IService {
    pipelines: IPipeline1;
  }
 export interface IConfig {
    [key: string]: any;
  service: IService; 
  }