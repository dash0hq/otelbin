// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

/*
 * Note, in order for TypeScript to properly generate type definitions, you need
 * to help it out. Specifically:
 *  - mark bindings as const
 *  - widen the fallback type in case it is not a primitive value
 *
 * Example showing const definition
 *   export const refreshBinding = {
 *     prefix: "settings",
 *     name: "refresh",
 *     fallback: false,
 *   } as const;
 *
 * And here is an example showing type widening to a fictitious type User
 *   export const userBinding = {
 *     prefix: "settings",
 *     name: "user",
 *     fallback: {} as User,
 *   } as const;
 *
 * In cases where there is no suitable fallback, you need to do the following:
 *   export const userBinding = {
 *     prefix: "settings",
 *     name: "user",
 *     fallback: null as null | User,
 *   } as const;
 */

export const editorBinding = {
	prefix: "",
	name: "config",
	fallback: `
# Learn more about the OpenTelemetry Collector via
# https://opentelemetry.io/docs/collector/

receivers:
  otlp:
		protocols:
			grpc:
			http:

processors:
  batch:

exporters:
  otlp:
  	endpoint: otelcol:4317

extensions:
  health_check:
  pprof:
  zpages:

service:
  extensions: [health_check, pprof, zpages]
  pipelines:
		traces:
			receivers: [otlp]
			processors: [batch]
			exporters: [otlp]
		metrics:
			receivers: [otlp]
			processors: [batch]
			exporters: [otlp]
		logs:
			receivers: [otlp]
			processors: [batch]
			exporters: [otlp]
`
		.trim()
		.replaceAll(/\t/g, "  ") as string,
} as const;
