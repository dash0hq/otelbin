export interface IPipeline {
	exporters?: string[];
	processors?: string[];
	receivers?: string[];
}

export interface IPipelines {
	[key: string]: IPipeline;
}
interface IService {
	pipelines?: IPipelines;
}
export interface IConfig {
	[key: string]: any;
	service?: IService;
}
