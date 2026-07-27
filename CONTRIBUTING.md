# Contributing

## Repository Layout

The repository holds three packages under `packages/`:

- **`otelbin`** — the Next.js app served at [otelbin.io](https://www.otelbin.io). This is where the UI, the editor, and short-link handling live.
- **`otelbin-validation`** — the AWS CDK infrastructure that hosts the server-side collector-configuration validation service. Managed via [`projen`](https://projen.io/).
- **`otelbin-validation-image`** — the Lambda container image used by the validation service.

Each package installs and runs independently. Most contributors touching the UI only need to work in `otelbin`.

## Local Development

Prerequisites: Node.js `>= 22` (see `.nvmrc`) and `make`.

Clone the repository and set the env vars outlined in the [`.env.example` file](https://github.com/dash0hq/otelbin/blob/main/packages/otelbin/.env.example).

The top-level `Makefile` wraps the common workflows. From the repository root:

```
make install   # install deps for every package (npm ci, lockfile-faithful)
make dev       # start the otelbin Next.js dev server
make test      # run every package's test suite
make lint      # run the otelbin app linter (eslint + prettier + tsc --noEmit)
make build     # build every package
```

Run `make` (or `make help`) to see all targets, including per-package variants like `make test-otelbin` for faster feedback when iterating on a single package.

If you prefer to work directly in a package, the equivalent per-package commands are:

```
cd packages/otelbin
npm ci        # install exactly what the lockfile pins (use over `npm i`)
npm test      # jest
npm run lint  # eslint + prettier + tsc --noEmit
npm run dev   # Next.js dev server
```

Use `npm ci` rather than `npm i`. `npm i` can update the lockfile silently and leave your `node_modules` in a state that no other contributor (or CI) will reproduce.

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