jest.mock("@expo/spawn-async", () => jest.fn());

const spawnAsync = require("@expo/spawn-async");
const {
	extractErrorPath,
	extractErrorMessage,
	buildValidationEnvironment,
	validateOtelCol
} = require("./index");

describe("extractErrorMessage", () => {
	it("must extract error message for OTel collector core/contrib when config parsing fails", () => {
		const stderr = "Error: failed to get config: cannot unmarshal the configuration: 1 error(s) decoding:\n" +
			"\n" +
			`* error decoding 'connectors': unknown type: "count" for id: "count" (valid values: [forward])\n` +
			"2024/02/10 15:56:42 collector server run finished with error: failed to get config: cannot unmarshal the configuration: 1 error(s) decoding:\n" +
			"\n" +
			`* error decoding 'connectors': unknown type: "count" for id: "count" (valid values: [forward])\n`;
		const expected = `error decoding 'connectors': unknown type: "count" for id: "count" (valid values: [forward])`;
		expect(extractErrorMessage(stderr)).toEqual(expected);
	});

	it("must extract error message for OTel collector core/contrib when config validation fails", () => {
		const stderr = 'Error: receivers::prometheus: no Prometheus scrape_configs or target_allocator set\n' +
			'2024/02/10 16:47:10 collector server run finished with error: receivers::prometheus: no Prometheus scrape_configs or target_allocator set\n';
		const expected = `receivers::prometheus: no Prometheus scrape_configs or target_allocator set`;
		expect(extractErrorMessage(stderr)).toEqual(expected);
	});

	it("must extract error message from ADOT collector when parsing fails", () => {
		const stderr = '2024/02/10 16:29:59 ADOT Collector version: v0.37.0\n' +
		'2024/02/10 16:29:59 found no extra config, skip it, err: open /opt/aws/aws-otel-collector/etc/extracfg.txt: permission denied\n' +
		'Error: failed to get config: cannot unmarshal the configuration: 1 error(s) decoding:\n' +
		'\n' +
		`* error decoding 'connectors': unknown type: "count" for id: "count" (valid values: [])\n`;
		const expected = `error decoding 'connectors': unknown type: "count" for id: "count" (valid values: [])`;
		expect(extractErrorMessage(stderr)).toEqual(expected);
	});

	it("must extract error message from ADOT collector when validation fails", () => {
		const stderr = '2024/02/10 16:40:18 ADOT Collector version: v0.37.0\n' +
			'2024/02/10 16:40:18 found no extra config, skip it, err: open /opt/aws/aws-otel-collector/etc/extracfg.txt: permission denied\n' +
			'Error: invalid configuration: service::pipelines::metrics: references receiver "count" which is not configured\n';
		const expected = `service::pipelines::metrics: references receiver "count" which is not configured`;
		expect(extractErrorMessage(stderr)).toEqual(expected);
	});
});

describe('extractErrorPath', () => {
	it('must extract error path from error message', () => {
		const errorMessage = `receivers::prometheus: no Prometheus scrape_configs or target_allocator set (Line 9)`;
		const expected = ['receivers', 'prometheus'];
		expect(extractErrorPath(errorMessage)).toEqual(expected);
	});
});


describe("buildValidationEnvironment", () => {
	const ecsEnvVar = "ECS_CONTAINER_METADATA_URI_V4";
	const originalEcsEndpoint = process.env[ecsEnvVar];

	beforeEach(() => {
		delete process.env[ecsEnvVar];
	});

	afterAll(() => {
		if (originalEcsEndpoint === undefined) {
			delete process.env[ecsEnvVar];
		} else {
			process.env[ecsEnvVar] = originalEcsEndpoint;
		}
	});

	it("adds a validation-only ECS metadata endpoint for awsecscontainermetrics", () => {
		const env = buildValidationEnvironment({
			receivers: {
				awsecscontainermetrics: {}
			}
		}, {});

		expect(env[ecsEnvVar]).toBe("http://127.0.0.1:9");
	});

	it("recognizes named awsecscontainermetrics receiver instances", () => {
		const env = buildValidationEnvironment({
			receivers: {
				"awsecscontainermetrics/task": {}
			}
		}, {});

		expect(env[ecsEnvVar]).toBe("http://127.0.0.1:9");
	});

	it("does not add an ECS metadata endpoint for unrelated receivers", () => {
		const env = buildValidationEnvironment({
			receivers: {
				otlp: {}
			}
		}, {});

		expect(env[ecsEnvVar]).toBeUndefined();
	});

	it("preserves an ECS metadata endpoint explicitly supplied by the caller", () => {
		const endpoint = "http://169.254.170.2/v4/example";
		const env = buildValidationEnvironment({
			receivers: {
				awsecscontainermetrics: {}
			}
		}, {
			[ecsEnvVar]: endpoint
		});

		expect(env[ecsEnvVar]).toBe(endpoint);
	});
});

describe("validateOtelCol", () => {
	beforeEach(() => {
		spawnAsync.mockReset();
		spawnAsync.mockResolvedValue({});
	});

	it("passes caller-provided environment variables to the Collector process", async () => {
		await validateOtelCol(
			"/usr/bin/otelcol",
			"/tmp/config.yaml",
			{ OTLP_ENDPOINT: "collector:4317" },
			{ receivers: { otlp: {} } }
		);

		expect(spawnAsync).toHaveBeenCalledWith(
			"/bin/sh",
			["-c", "/usr/bin/otelcol validate --config=/tmp/config.yaml"],
			expect.objectContaining({
				env: expect.objectContaining({
					OTLP_ENDPOINT: "collector:4317"
				})
			})
		);
	});
});
