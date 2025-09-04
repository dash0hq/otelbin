#!/usr/bin/env bash

set -euox pipefail

if [[ "${GH_ARTIFACT}" = http* ]]; then
    # Artifact is a downloadable URL
    curl --silent --fail --show-error --location "${GH_ARTIFACT}" -o /tmp/otelcol.rpm
else
    gh release download "--repo=${GH_REPOSITORY}" "${GH_RELEASE}" "--pattern=${GH_ARTIFACT}"
    mv "${GH_ARTIFACT}" /tmp/otelcol.rpm
fi
