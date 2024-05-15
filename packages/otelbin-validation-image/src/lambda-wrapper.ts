const { NodeTracerConfig, NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const {
	BatchSpanProcessor,
	ConsoleSpanExporter,
	SDKRegistrationConfig,
	SimpleSpanProcessor
} = require("@opentelemetry/sdk-trace-base");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const { awsLambdaDetector } = require("@opentelemetry/resource-detector-aws");
const { detectResourcesSync, envDetector, processDetector } = require("@opentelemetry/resources");
const { AwsInstrumentation } = require("@opentelemetry/instrumentation-aws-sdk");
const {
	AwsLambdaInstrumentation,
} = require("@opentelemetry/instrumentation-aws-lambda");
const { diag, DiagConsoleLogger, DiagLogLevel } = require("@opentelemetry/api");
const { getEnv } = require("@opentelemetry/core");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-proto");
const { MeterProvider, MeterProviderOptions } = require("@opentelemetry/sdk-metrics");

function defaultConfigureInstrumentations() {
	// Use require statements for instrumentation to avoid having to have transitive dependencies on all the typescript
	// definitions.
	const { DnsInstrumentation } = require("@opentelemetry/instrumentation-dns");
	const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
	const { NetInstrumentation } = require("@opentelemetry/instrumentation-net");
	return [new DnsInstrumentation(),
		new HttpInstrumentation(),
		new NetInstrumentation()
	];
}

console.log("Registering OpenTelemetry");

const instrumentations = [
	new AwsInstrumentation({
		suppressInternalInstrumentation: true
	}),
	new AwsLambdaInstrumentation(defaultConfigureInstrumentations())
];

// configure lambda logging
const logLevel = getEnv().OTEL_LOG_LEVEL;
diag.setLogger(new DiagConsoleLogger(), logLevel);

// Register instrumentations synchronously to ensure code is patched even before provider is ready.
registerInstrumentations({
	instrumentations
});

async function initializeProvider() {
	const resource = detectResourcesSync({
		detectors: [awsLambdaDetector, envDetector, processDetector]
	});

	let config: typeof NodeTracerConfig = {
		resource
	};

	const tracerProvider = new NodeTracerProvider(config);
		tracerProvider.addSpanProcessor(
			new BatchSpanProcessor(new OTLPTraceExporter())
		);
	// logging for debug
	if (logLevel===DiagLogLevel.DEBUG) {
		tracerProvider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
	}

	let sdkRegistrationConfig: typeof SDKRegistrationConfig = {};
	tracerProvider.register(sdkRegistrationConfig);

	// Configure default meter provider (doesn't export metrics)
	let meterConfig: typeof MeterProviderOptions = {
		resource
	};

	const meterProvider = new MeterProvider(meterConfig);
	// Re-register instrumentation with initialized provider. Patched code will see the update.
	registerInstrumentations({
		instrumentations,
		tracerProvider,
		meterProvider
	});
}

initializeProvider();
