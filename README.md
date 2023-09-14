# OTelBin

OTelBin is a configuration tool for OpenTelemetry collectors. See https://opentelemetry.io/docs/collector/ for more information.


## Deployment

 - [Development](https://otelbin.vercel.app)
 - [Production](https://www.otelbin.com)

## Getting Started

```sh
git clone git@github.com:dash0hq/opentelemetry-collector-web.git
cd opentelemetry-collector-web
cp .env.example .env
# Ask a colleague for the contents of .env, especially for DATABASE_URL as it contains secrets. Do
# not update the .env.example file
npm install
npm run dev
```

## Using the JSON Schema

This repository uses a JSON schema from the VS Code's extension [OTEL Validator](https://github.com/nimbushq/otel-validator) in order to provide validation for the collector configuration file.

To get the latest schema version, either clone the repository and copy the schema from `assets/schema.json` or directly download the file from [the repository](https://github.com/nimbushq/otel-validator/blob/main/assets/schema.json).

## License

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
