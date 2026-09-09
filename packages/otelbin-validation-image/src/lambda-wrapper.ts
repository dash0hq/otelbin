// This code is a 99% copy of the official OpenTelemetry Lambda wrapper for Node.js.
// https://github.com/open-telemetry/opentelemetry-lambda/blob/fefd74405214790644fe262b0f5a8a636c029184/nodejs/packages/layer/src/wrapper.ts
//
// Unfortunately, we couldn't use it as a dependency, because it is not published to npm.
//
// Changes from original:
// - removed ability to overwrite config sections via globals
// - removed some default instrumentations
// - static imports instead of require(), so tsc checks these calls against the SDK's real types.
//   Under require() every SDK symbol is `any`, which is how the removal of addSpanProcessor in
//   SDK 2.0 reached a deployed Lambda with no build step objecting to it.
// - the DNS, HTTP and Net instrumentations are listed in `instrumentations` rather than passed
//   to AwsLambdaInstrumentation as its config. See the comment on that array.

import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api';
import { diagLogLevelFromString, getStringFromEnv } from '@opentelemetry/core';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { AwsLambdaInstrumentation } from '@opentelemetry/instrumentation-aws-lambda';
import { AwsInstrumentation } from '@opentelemetry/instrumentation-aws-sdk';
import { DnsInstrumentation } from '@opentelemetry/instrumentation-dns';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { NetInstrumentation } from '@opentelemetry/instrumentation-net';
import { awsLambdaDetector } from '@opentelemetry/resource-detector-aws';
import { detectResources, envDetector, processDetector } from '@opentelemetry/resources';
import { MeterProvider } from '@opentelemetry/sdk-metrics';
import { BatchSpanProcessor, ConsoleSpanExporter, SimpleSpanProcessor, SpanProcessor } from '@opentelemetry/sdk-trace-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';

console.log("Registering OpenTelemetry");

/*
 * The DNS, HTTP and Net instrumentations used to be built by a helper whose return value, an
 * array, was passed to AwsLambdaInstrumentation as its config object. They were never part of
 * this list. They still took effect, because constructing an instrumentation patches its target
 * on its own, and spreading an array into the config yields only numeric keys, so that argument
 * was equivalent to `{}`. Listing them here keeps exactly that behaviour while letting tsc check
 * the call, which it cannot do when an array is passed where a config is expected.
 */
const instrumentations = [
	new AwsInstrumentation({
		suppressInternalInstrumentation: true
	}),
	new AwsLambdaInstrumentation({}),
	new DnsInstrumentation(),
	new HttpInstrumentation(),
	new NetInstrumentation()
];

// configure lambda logging.
// SDK 2.0 removed getEnv(). diagLogLevelFromString is the supported way to read OTEL_LOG_LEVEL and
// returns undefined for an unset or unrecognised value, which leaves diag at its default level.
const logLevel = diagLogLevelFromString(getStringFromEnv("OTEL_LOG_LEVEL"));
diag.setLogger(new DiagConsoleLogger(), logLevel);

// Register instrumentations synchronously to ensure code is patched even before provider is ready.
registerInstrumentations({
	instrumentations
});

// SDK 2.0 removed detectResourcesSync. detectResources is synchronous and returns a Resource.
const resource = detectResources({
	detectors: [awsLambdaDetector, envDetector, processDetector]
});

// SDK 2.0 removed TracerProvider.addSpanProcessor(). Processors are constructor-only now, so the
// list has to be complete before the provider is built instead of appended to afterwards.
const spanProcessors: SpanProcessor[] = [
	new BatchSpanProcessor(new OTLPTraceExporter())
];

// logging for debug
if (logLevel === DiagLogLevel.DEBUG) {
	spanProcessors.push(new SimpleSpanProcessor(new ConsoleSpanExporter()));
}

const tracerProvider = new NodeTracerProvider({
	resource,
	spanProcessors
});
tracerProvider.register();

// Configure default meter provider (doesn't export metrics)
const meterProvider = new MeterProvider({
	resource
});

// Re-register instrumentation with initialized provider. Patched code will see the update.
registerInstrumentations({
	instrumentations,
	tracerProvider,
	meterProvider
});
