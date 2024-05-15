import { extractErrorMessage, extractErrorPath } from "./index";

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
