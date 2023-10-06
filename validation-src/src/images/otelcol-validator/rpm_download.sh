#!/usr/bin/env bash

set -euox pipefail

mkdir /download

if [[ "${GH_ARTIFACT}" = http* ]]; then
    # Artifact is a downloadable URL
	curl --fail --location "${GH_ARTIFACT}" -o /download/otelcol.rpm
else
    gh release download "--repo=${GH_REPOSITORY}" "${GH_RELEASE}" "--pattern=${GH_ARTIFACT}"
    mv "${GH_ARTIFACT}" /download/otelcol.rpm
fi
