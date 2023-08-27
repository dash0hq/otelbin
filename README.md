# OTelBin

OTelBin is a configuration tool for OpenTelemetry collectors. See https://opentelemetry.io/docs/collector/ for more information.

## Deployment

 - [Development](https://otelbin.vercel.app)
 - [Production](https://www.otelbin.com)

## Design

 - [Figma](https://www.figma.com/file/XQbqQZ36hR9huEVadq56jX/Otelbin?type=design&node-id=656-7328&mode=design&t=e7d3LTDfSdyxEb7a-0)

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


