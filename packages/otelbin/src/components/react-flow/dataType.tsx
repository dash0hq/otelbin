// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

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
	[key: string]: unknown;
	connectors: object;
	service?: IService;
}
