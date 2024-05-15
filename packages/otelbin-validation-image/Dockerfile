FROM debian AS downloader

ARG GH_TOKEN
ARG GH_REPOSITORY
ARG GH_RELEASE
ARG GH_ARTIFACT

ENV GH_TOKEN="${GH_TOKEN}"
ENV GH_REPOSITORY="${GH_REPOSITORY}"
ENV GH_RELEASE="${GH_RELEASE}"
ENV GH_ARTIFACT="${GH_ARTIFACT}"

# Install the 'rpm_download' script dependencies
RUN apt-get update \
&& apt-get install bash curl -y \
&& curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
&& chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | tee /etc/apt/sources.list.d/github-cli.list > /dev/null \
&& apt-get update \
&& apt-get install gh -y

WORKDIR /usr/app
ADD ./rpm_download.sh /usr/app/rpm_download.sh

RUN /usr/app/rpm_download.sh

FROM public.ecr.aws/lambda/nodejs:18 AS builder

WORKDIR /usr/app
COPY package.json package.json
COPY src/ src/
RUN npm install
RUN npm run build

FROM golang:1.22 AS builder-extension

RUN apt-get update && apt-get install -y zip make
RUN wget https://github.com/open-telemetry/opentelemetry-lambda/archive/refs/tags/layer-collector/0.6.0.zip
RUN unzip 0.6.0.zip
WORKDIR /go/opentelemetry-lambda-layer-collector-0.6.0/collector
RUN make package

FROM public.ecr.aws/lambda/nodejs:18

# Install useradd command needed by the OtelContrib RPM
WORKDIR /tmp
RUN yum -y install python3 python3-pip shadow-utils

WORKDIR /usr/otelcol
COPY --from=downloader /download/otelcol.rpm otelcol.rpm
COPY --from=builder-extension /go/opentelemetry-lambda-layer-collector-0.6.0/collector/build/extensions /opt/extensions

# Install the collector's RPM package
RUN rpm -i otelcol.rpm \
# Ensure we have a stable path to invoke the collector.
# This step assumes there is only one executable binary installed by the RPM package or,
# if there are multiple, the collector is the first listed.
# For example, ADOT installs two binaries: /opt/aws/aws-otel-collector and a /usr/bin/aws-otel-collector-ctl,
# and the one we should link is the first.
# If an RPM package already installs a file under /usr/bin/otelcol, good enough :-)
&& test -f /usr/bin/otelcol || for file in $(rpm -qlp otelcol.rpm) ; do test -x $file && test -f $file && echo $file ; done | head -1 | xargs -I{} ln -s {} /usr/bin/otelcol

# Add the event handler
COPY --from=builder /usr/app/dist /usr/app/src
COPY --from=builder /usr/app/package.json /usr/app/src/package.json

# Copy the collector config so that telemetry data can be exported.
# https://github.com/open-telemetry/opentelemetry-lambda/blob/layer-collector/0.6.0/collector/internal/collector/collector.go#L51-L54
COPY collector.yaml /opt/collector-config/config.yaml
ENV OTEL_SERVICE_NAME=OTelBin
ENV OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4328
ENV OTEL_PROPAGATORS="tracecontext,baggage"
ENV NODE_OPTIONS="--require /usr/app/src/lambda-wrapper.js"
ENV OTEL_LOG_LEVEL=DEBUG

WORKDIR /usr/app/src

CMD ["/usr/app/src/index.handler"]
