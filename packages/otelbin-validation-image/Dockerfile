FROM alpine:3.22 AS downloader

ARG GH_TOKEN
ARG GH_REPOSITORY
ARG GH_RELEASE
ARG GH_ARTIFACT

ENV GH_TOKEN="${GH_TOKEN}"
ENV GH_REPOSITORY="${GH_REPOSITORY}"
ENV GH_RELEASE="${GH_RELEASE}"
ENV GH_ARTIFACT="${GH_ARTIFACT}"

# Install the 'rpm_download' script dependencies
RUN apk --no-cache add bash curl github-cli
COPY --chmod=0755 ./rpm_download.sh /usr/bin/rpm_download.sh
RUN /usr/bin/rpm_download.sh

FROM public.ecr.aws/lambda/nodejs:22 AS builder

WORKDIR /usr/app
COPY package.json package.json
RUN npm install
COPY src/ src/
RUN npm run build

FROM alpine:3.22 AS builder-extension

ARG TARGETARCH

ADD https://github.com/open-telemetry/opentelemetry-lambda/releases/download/layer-collector%2F0.17.0/opentelemetry-collector-layer-${TARGETARCH}.zip /tmp
RUN apk --no-cache add unzip && unzip /tmp/opentelemetry-collector-layer-${TARGETARCH}.zip -d /tmp

FROM public.ecr.aws/lambda/nodejs:22

# Install useradd command needed by the otelcontrib RPM and xargs
RUN microdnf -y install findutils shadow-utils util-linux; microdnf clean all

COPY --from=downloader /tmp/otelcol.rpm /tmp/otelcol.rpm
COPY --from=builder-extension /tmp/extensions /opt/extensions

# Install the collector's RPM package
RUN rpm -i /tmp/otelcol.rpm \
# Ensure we have a stable path to invoke the collector.
# This step assumes there is only one executable binary installed by the RPM package or,
# if there are multiple, the collector is the first listed.
# For example, ADOT installs two binaries: /opt/aws/aws-otel-collector and a /usr/bin/aws-otel-collector-ctl,
# and the one we should link is the first.
# If an RPM package already installs a file under /usr/bin/otelcol, good enough :-)
  && set -o pipefail \
  && (test -f /usr/bin/otelcol || for file in $(rpm -qlp /tmp/otelcol.rpm) ; do (test -x "${file}" -a -f "${file}" && echo "${file}") || true ; done | head -1 | xargs -I{} ln -s {} /usr/bin/otelcol && rm -f /tmp/otelbin.rpm)

# Add the event handler
COPY --from=builder /usr/app/dist /usr/app/src
COPY --from=builder /usr/app/package.json /usr/app/src/package.json

# Copy the collector config so that telemetry data can be exported.
# https://github.com/open-telemetry/opentelemetry-lambda/blob/layer-collector/0.6.0/collector/internal/collector/collector.go#L51-L54
COPY collector.yaml /opt/collector-config/config.yaml

# Set relevant environment variable to enable OpenTelemetry
ENV OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4328
ENV OTEL_PROPAGATORS="tracecontext,baggage"
ENV OTEL_LAMBDA_DISABLE_AWS_CONTEXT_PROPAGATION=true
# Fix "DEBUG Recording is off, propagating context in a non-recording span"
ENV OTEL_TRACES_SAMPLER=always_on
#ENV OTEL_LOG_LEVEL=DEBUG
ENV NODE_OPTIONS="--require /usr/app/src/lambda-wrapper.js"
ENV _HANDLER="index.handler"

WORKDIR /usr/app/src

CMD ["/usr/app/src/index.handler"]
