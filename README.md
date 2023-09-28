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

### Updated Schema

We've recently updated the JSON schema to include support for `service.telemetry` and `connectors`.

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

8. __Review and Collaboration:__  

* Collaborate with other contributors and maintainers during the PR review process. Address any feedback or comments to ensure the schema aligns with the project's needs.

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


