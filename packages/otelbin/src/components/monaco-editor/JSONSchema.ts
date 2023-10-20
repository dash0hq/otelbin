// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import type { JSONSchemaType } from "ajv";

interface IPipeline {
	receivers: string[];
	processors?: string[];
	exporters: string[];
}

interface IPipelines {
	[name: string]: IPipeline;
}

interface IService {
	pipelines: IPipelines;
}

interface IOtelConfig {
	receivers: object;
	processors: object;
	exporters: object;
	extensions: object;
	service: IService;
	connectors: object;
}

// @ts-expect-error TypeScript cannot correctly correlate the schema with the TypeScript types.
export const schema: JSONSchemaType<IOtelConfig> = {
	$schema: "http://json-schema.org/draft-07/schema#",
	$id: "https://dash0.com/otelcollector.json",
	title: "OpenTelemetry Collector Configuration",
	description: "OpenTelemetry Collector Configuration",
	type: "object",
	properties: {
		receivers: {
			type: "object",
			additionalProperties: true,
			errorMessage: {
				type: "receivers property must be yaml map/dictionary",
			},
		},
		processors: {
			type: "object",
			additionalProperties: true,
			errorMessage: {
				type: "processors property must be yaml map/dictionary",
			},
		},
		exporters: {
			type: "object",
			additionalProperties: true,
			errorMessage: {
				type: "exporters property must be yaml map/dictionary",
			},
		},
		extensions: {
			type: "object",
			additionalProperties: true,
			errorMessage: {
				type: "extensions property must be yaml map/dictionary",
			},
		},
		service: {
			type: "object",
			additionalProperties: true,
			properties: {
				pipelines: {
					type: "object",
					additionalProperties: {
						type: "object",
						properties: {
							receivers: {
								type: "array",
								minItems: 1,
								errorMessage: {
									minItems: "At least one receiver is required",
								},
							},
							processors: {
								type: "array",
							},
							exporters: {
								type: "array",
								minItems: 1,
								errorMessage: {
									minItems: "At least one exporter is required",
								},
							},
						},
						required: ["receivers", "exporters"],
						errorMessage: {
							required: {
								receivers: 'receivers property is required',
								exporters: 'exporters property is required',
							},
						},
					},
					errorMessage: {
						type: "pipelines property must be yaml map/dictionary",
					},
				},
			},
			required: ["pipelines"],
			errorMessage: {
				required: "pipelines property is required",
				type: "service property must be yaml map/dictionary",
			},
		},
		connectors: {
			type: "object",
			additionalProperties: true,
			errorMessage: {
				type: "connectors property must be yaml map/dictionary",
			},
		},
	},
	errorMessage: {
		type: "Must be a a valid OpenTelemetry Collector configuration",
		required: "service property is required",
	},
	required: ["service"],
};
