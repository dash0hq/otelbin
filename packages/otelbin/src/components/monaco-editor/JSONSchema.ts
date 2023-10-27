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
		},
		processors: {
			type: "object",
			additionalProperties: true,
		},
		exporters: {
			type: "object",
			additionalProperties: true,
		},
		extensions: {
			type: "object",
			additionalProperties: true,
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
							},
							processors: {
								type: "array",
							},
							exporters: {
								type: "array",
								minItems: 1,
							},
						},
						required: ["receivers", "exporters"],
					},
				},
			},
			required: ["pipelines"],
		},
		connectors: {
			type: "object",
			additionalProperties: true,
		},
	},
	required: ["service"],
};
