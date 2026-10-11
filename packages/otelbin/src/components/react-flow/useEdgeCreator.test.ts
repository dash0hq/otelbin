// SPDX-FileCopyrightText: 2026 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "@jest/globals";
import { calcEdges } from "./useEdgeCreator";
import { calcNodes } from "./useClientNodes";
import type { IConfig } from "./dataType";

function connectorEdges(config: IConfig) {
	return calcEdges(calcNodes(config)).filter((edge) => edge.data?.type === "connector");
}

describe("forward connector edges", () => {
	it.each(["traces", "metrics", "logs"])("only forwards %s to pipelines with the same signal", (signal) => {
		const config: IConfig = {
			connectors: { forward: {} },
			service: {
				pipelines: {
					[`${signal}/input`]: { receivers: ["otlp"], exporters: ["forward"] },
					"traces/output": { receivers: ["forward"], exporters: ["debug"] },
					"metrics/output": { receivers: ["forward"], exporters: ["debug"] },
					"logs/output": { receivers: ["forward"], exporters: ["debug"] },
				},
			},
		};

		expect(connectorEdges(config).map((edge) => edge.data)).toEqual([
			{
				type: "connector",
				sourcePipeline: `${signal}/input`,
				targetPipeline: `${signal}/output`,
			},
		]);
	});

	it("preserves same-signal fan-out for named forward connectors", () => {
		const config: IConfig = {
			connectors: { "forward/shared/name": {}, "forward/other": {} },
			service: {
				pipelines: {
					metrics: { receivers: ["otlp"], exporters: ["forward/shared/name"] },
					"metrics/first": { receivers: ["forward/shared/name"], exporters: ["debug"] },
					"metrics/second": { receivers: ["forward/shared/name"], exporters: ["debug"] },
					traces: { receivers: ["forward/shared/name"], exporters: ["debug"] },
					"metrics/other": { receivers: ["forward/other"], exporters: ["debug"] },
				},
			},
		};

		expect(connectorEdges(config).map((edge) => edge.data.targetPipeline)).toEqual(["metrics/first", "metrics/second"]);
	});

	it("keeps cross-signal edges for other connector types", () => {
		const config: IConfig = {
			connectors: { "count/requests": {} },
			service: {
				pipelines: {
					traces: { receivers: ["otlp"], exporters: ["count/requests"] },
					metrics: { receivers: ["count/requests"], exporters: ["debug"] },
				},
			},
		};

		expect(connectorEdges(config).map((edge) => edge.data)).toEqual([
			{ type: "connector", sourcePipeline: "traces", targetPipeline: "metrics" },
		]);
	});
});
