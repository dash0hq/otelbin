import { trace } from "@opentelemetry/api";

/*
 * Importing the wrapper is the test. It exports nothing and does all of its work as import side
 * effects, so every incompatibility this upgrade had to resolve (TracerProvider.addSpanProcessor,
 * detectResourcesSync and getEnv all removed in SDK 2.0) throws a TypeError on that import. Until
 * this file existed the only thing exercising those calls was a deployed Lambda, where the failure
 * arrived as an HTTP 502 from API Gateway roughly half an hour after the merge.
 */
describe("lambda-wrapper", () => {
	it("registers a tracer provider that records spans", () => {
		expect(() => require("./lambda-wrapper")).not.toThrow();

		/*
		 * isRecording() is what separates a real SDK span from the API's no-op fallback. A provider
		 * that is constructed but never registered, or registered without a span processor, still
		 * hands back a NonRecordingSpan here, so this catches a silent registration failure that a
		 * clean import would otherwise hide.
		 */
		const span = trace.getTracer("lambda-wrapper-test").startSpan("probe");
		expect(span.isRecording()).toBe(true);
		expect(span.spanContext().traceId).not.toBe("00000000000000000000000000000000");

		/*
		 * The detected resource has to reach the provider, not merely be computed. `process.runtime.name`
		 * comes from processDetector, one of the three detectors handed to detectResources. `resource`
		 * is on the SDK's span implementation rather than the API's Span interface, hence the cast.
		 */
		const { resource } = span as unknown as { resource: { attributes: Record<string, unknown> } };
		expect(resource.attributes["process.runtime.name"]).toBe("nodejs");

		span.end();
	});
});
