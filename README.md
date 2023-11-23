<a href="https://www.otelbin.io">
  <img alt="OTelBin is a configuration tool for OpenTelemetry collector pipelines" src="https://github.com/dash0hq/otelbin/assets/596443/eb9bacb0-e94e-4ccb-af5a-f245adf19615">
  <h1 align="center">OTelBin</h1>
</a>

<p align="center">
  OTelBin is a configuration tool for OpenTelemetry collector pipelines.
</p>

<p align="center">
  <a href="https://twitter.com/dash0hq"><img src="https://img.shields.io/twitter/follow/dash0hq?style=flat&label=%40dash0hq&logo=twitter&color=0bf&logoColor=fff" alt="Twitter" /></a>
  <a href="https://github.com/dash0hq/otelbin/blob/main/LICENSE"><img src="https://img.shields.io/github/license/dash0hq/otelbin?label=license&logo=github&logoColor=fff&color=f80" alt="License" /></a>
  <a href="https://sonarcloud.io/project/overview?id=dash0hq_otelbin"><img src="https://sonarcloud.io/api/project_badges/measure?project=dash0hq_otelbin&metric=alert_status" alt="SonarCloud" /></a>
</p>

<p align="center">
  <a href="#introduction"><strong>Introduction</strong></a> ·
  <a href="#features"><strong>Features</strong></a> ·
  <a href="#badges"><strong>Badges</strong></a> ·
  <a href="#tech-stack"><strong>Tech Stack</strong></a> ·
  <a href="#contributing"><strong>Contributing</strong></a> ·
  <a href="./LICENSE"><strong>License</strong></a>
</p>
<br/>

## Introduction

OTelBin is a configuration tool to help you get the most out of the [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/).

OTelBin hosted with :heart: by the [Dash0](https://github.com/dash0hq) people at [otelbin.io](https://www.otelbin.io).

## Features

OTelBin will enable you to:

1. Visualize for you the configured OpenTelemetry Collector pipelines as swimlanes
1. Validate your configuration and highlight errors
1. Enable you to share your OpenTelemetry Collector configurations online (requires login with a GitHub or Google account)

## Badges

Use [shields.io-powered](https://shields.io/) badges within documentation to reference a collector configuration.

![OpenTelemetry collector configuration on OTelBin](https://www.otelbin.io/shields/collector-config)

- **URL**
  ```
  https://www.otelbin.io/shields/collector-config
  ```
- **Markdown**
  ```md
  ![OpenTelemetry collector configuration on OTelBin](https://www.otelbin.io/shields/collector-config)
  ```
- **HTML**
  ```
  <img src="https://www.otelbin.io/shields/collector-config" alt="OpenTelemetry collector configuration on OTelBin">
  ```

## Tech Stack

- [Next.js](https://nextjs.org/) – framework
- [Typescript](https://www.typescriptlang.org/) – language
- [Tailwind](https://tailwindcss.com/) – CSS
- [Upstash](https://upstash.com/) – redis
- [Clerk](https://clerk.com/) – auth
- [Vercel](https://vercel.com/) – hosting and privacy-friendly analytics
- [AWS Lambda](https://aws.amazon.com/lambda/) – validation of configs against OpenTelemetry collectors

## Contributing

We love our contributors! Here's how you can contribute:

- [Learn how to develop locally.](https://github.com/dash0hq/otelbin/blob/main/CONTRIBUTING.md)
- [Open an issue](https://github.com/dash0hq/otelbin/issues) if you believe you've encountered a bug.
- Make a [pull request](https://github.com/dash0hq/otelbin/pull) to add new features/make quality-of-life improvements/fix bugs.

<a href="https://github.com/dash0hq/otelbin/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=dash0hq/otelbin&cache=bust2" />
</a>

## Acknowledgements

OTelBin makes use of the output of [cfgmetadatagen](https://github.com/open-telemetry/opentelemetry-collector-contrib/tree/main/cmd/configschema/cfgmetadatagen/cfgmetadatagen)
and specifically a post-processed version of it that is part of [nimbushq/otel-validator](https://github.com/nimbushq/otel-validator).
