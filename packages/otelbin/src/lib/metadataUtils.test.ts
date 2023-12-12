// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { describe, expect, it } from "@jest/globals";
import { sortAndDeduplicate, extractComponents } from "./metadataUtils";
import type { IConfig } from "~/components/react-flow/dataType";

describe("sortAndDeduplicate", () => {
    it("should sort and deduplicate an array of strings and return a comma separated string of components", () => {
        const array = ["count", "prometheus", "prometheus/metricsStore", "otlp", "otlp/metricsStore"];
        const result = sortAndDeduplicate(array);
        expect(result).toEqual("count, otlp, prometheus");
    });

    it("should return `-` with array length of 0", () => {
        const array: string[] = [];
        const result = sortAndDeduplicate(array);
        expect(result).toEqual("-");
    });
});

//The otel-col config json file
const jsonEditorBinding = {
    connectors: { jaeger: { protocols: [Object] } },
    receivers: { otlp: { protocols: [Object] } },
    processors: { batch: null },
    exporters: { otlp: { endpoint: "otelcol:4317" } },
    extensions: { health_check: null, pprof: null, zpages: null },
    service: {
        extensions: ["health_check", "pprof", "zpages"],
        pipelines: { traces: [Object], metrics: [Object], logs: [Object] },
    },
} as IConfig;

describe("extractComponents", () => {
    it("should extract all the components consisting exporters,processors,receivers except service from otel-col config json file correctly and return as an array of strings", () => {
        const result = extractComponents(jsonEditorBinding);
        expect(result).toEqual(["jaeger", "otlp", "batch", "otlp", "health_check", "pprof", "zpages"]);
    });
    it('should return ["-"] if the input json data is empty', () => {
        const result = extractComponents({} as IConfig);
        expect(result).toEqual(["-"]);
    });
});
