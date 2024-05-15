import { NodeTracerConfig, NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import {
	BatchSpanProcessor,
	ConsoleSpanExporter,
	SDKRegistrationConfig,
	SimpleSpanProcessor
} from "@opentelemetry/sdk-trace-base";
import { Instrumentation, registerInstrumentations } from "@opentelemetry/instrumentation";
import { awsLambdaDetector } from "@opentelemetry/resource-detector-aws";
import { detectResourcesSync, envDetector, processDetector } from "@opentelemetry/resources";
import { AwsInstrumentation } from "@opentelemetry/instrumentation-aws-sdk";
import { AwsLambdaInstrumentation, AwsLambdaInstrumentationConfig } from "@opentelemetry/instrumentation-aws-lambda";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { getEnv } from "@opentelemetry/core";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { MeterProvider, MeterProviderOptions } from "@opentelemetry/sdk-metrics";

function defaultConfigureInstrumentations() {
	// Use require statements for instrumentation to avoid having to have transitive dependencies on all the typescript
	// definitions.
	const { DnsInstrumentation } = require('@opentelemetry/instrumentation-dns');
	const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http');
	const { NetInstrumentation } = require('@opentelemetry/instrumentation-net');
	return [  new DnsInstrumentation(),
		new HttpInstrumentation(),
		new NetInstrumentation(),
	]
}

declare global {
	// in case of downstream configuring span processors etc
	function configureTracerProvider(tracerProvider: NodeTracerProvider): void
	function configureTracer(defaultConfig: NodeTracerConfig): NodeTracerConfig;
	function configureSdkRegistration(
		defaultSdkRegistration: SDKRegistrationConfig
	): SDKRegistrationConfig;
	function configureMeter(defaultConfig: MeterProviderOptions): MeterProviderOptions;
	function configureMeterProvider(meterProvider: MeterProvider): void
	function configureLambdaInstrumentation(config: AwsLambdaInstrumentationConfig): AwsLambdaInstrumentationConfig
	function configureInstrumentations(): Instrumentation[]
}

console.log('Registering OpenTelemetry');

const instrumentations = [
	new AwsInstrumentation({
		suppressInternalInstrumentation: true,
	}),
	new AwsLambdaInstrumentation(typeof configureLambdaInstrumentation === 'function' ? configureLambdaInstrumentation({
		disableAwsContextPropagation: true
	}) : {}),
	...(typeof configureInstrumentations === 'function' ? configureInstrumentations: defaultConfigureInstrumentations)()
];

// configure lambda logging
const logLevel = getEnv().OTEL_LOG_LEVEL
diag.setLogger(new DiagConsoleLogger(), logLevel)

// Register instrumentations synchronously to ensure code is patched even before provider is ready.
registerInstrumentations({
	instrumentations,
});

async function initializeProvider() {
	const resource = detectResourcesSync({
		detectors: [awsLambdaDetector, envDetector, processDetector],
	});

	let config: NodeTracerConfig = {
		resource,
	};
	if (typeof configureTracer === 'function') {
		config = configureTracer(config);
	}

	const tracerProvider = new NodeTracerProvider(config);
	if (typeof configureTracerProvider === 'function') {
		configureTracerProvider(tracerProvider)
	} else {
		// defaults
		tracerProvider.addSpanProcessor(
			new BatchSpanProcessor(new OTLPTraceExporter())
		);
	}
	// logging for debug
	if (logLevel === DiagLogLevel.DEBUG) {
		tracerProvider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
	}

	let sdkRegistrationConfig: SDKRegistrationConfig = {};
	if (typeof configureSdkRegistration === 'function') {
		sdkRegistrationConfig = configureSdkRegistration(sdkRegistrationConfig);
	}
	tracerProvider.register(sdkRegistrationConfig);

	// Configure default meter provider (doesn't export metrics)
	let meterConfig: MeterProviderOptions = {
		resource,
	}
	if (typeof configureMeter === 'function') {
		meterConfig = configureMeter(meterConfig);
	}

	const meterProvider = new MeterProvider(meterConfig);
	if (typeof configureMeterProvider === 'function') {
		configureMeterProvider(meterProvider)
	}

	// Re-register instrumentation with initialized provider. Patched code will see the update.
	registerInstrumentations({
		instrumentations,
		tracerProvider,
		meterProvider
	});
}
initializeProvider();
