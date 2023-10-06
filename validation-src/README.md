# Validation infrastructure

OTelBin supports validation that is specific to multiple distributions of the OpenTelemetry collector.
The supported distros and versions are listed in the [`src/supported-distributions`](./src/supported-distributions) file.
The distributions are assumed to be available as GitHub releases.

## Deployment

1. Log in with the [`AWS cli`](https://aws.amazon.com/cli/) to the account you want to deploy.
   Ensure you have a profile that uses the region you want to deploy in, e.g.:
   ```json
   [otelbin-eu-central-1]
   region = eu-central-1
   output = json
   ``` 
1. Get a GitHub classic token, which is needed by the automation to be able to download GitHub release artifacts using the [`gh`](https://cli.github.com) utility.
1. Run:
   ```sh
   GH_TOKEN=<token> npx run deploy --profile <aws-cli-profile>
   ```