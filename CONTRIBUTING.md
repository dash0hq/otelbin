# Contributing

## Local Development

To develop OTelBin locally, you will need to clone this repository and set up all the env vars outlined in the [`.env.example` file](https://github.com/dash0hq/otelbin/blob/main/packages/otelbin/.env.example).

Once that's done, you can use the following commands to run the app locally:

```
cd packages/otelbin
npm i
npm run dev
```

## Using the JSON Schema

This repository uses a JSON schema from the VS Code's extension [OTEL Validator](https://github.com/nimbushq/otel-validator) in order to provide validation for the collector configuration file.

To get the latest schema version, either clone the repository and copy the schema from `assets/schema.json` or directly download the file from the [`nimbushq/otel-validator`](https://github.com/nimbushq/otel-validator/blob/main/assets/schema.json) repository.

### Updated Schema

To update the JSON schema for this project, follow these steps:

1. __Familiarize Yourself with JSON Schema:__
* Read through the [official JSON Schema documentation](https://json-schema.org/) to understand its structure and rules.

2. __Review the Upstream Repository:__
* Visit the [OpenTelemetry official website](https://opentelemetry.io/), [OpenTelemetry Collector github repository](https://github.com/open-telemetry/opentelemetry-collector/tree/main) and [OpenTelemetry Contrib GitHub repository](https://github.com/open-telemetry/opentelemetry-collector-contrib) to explore the latest changes and properties that need to be reflected in the JSON schema.

3. __Identify Missing Properties:__
* Examine the Go files, READMEs, or other relevant sources in the mentioned sources to identify properties and configurations that are not yet included in the JSON schema.

4. __Update the Schema:__
* Make changes to the JSON schema file in your forked repository based on the properties and configurations you've identified. You can use a JSON schema editor or a text editor to make these updates.

5. __Test Your Changes:__
* Ensure that your updated JSON schema is valid by using JSON schema validation tools. This will help catch any syntax or structural issues in your schema.

6. __Commit and Push:__
* Commit your changes to the JSON schema file in your forked repository.

7. __Create a Pull Request:__
* Visit your forked repository on GitHub and create a pull request (PR) to merge your changes into the main repository's JSON schema.

## Adding support for a new distribution

See the [dedicated documentation](./packages/otelbin-validation/README.md).