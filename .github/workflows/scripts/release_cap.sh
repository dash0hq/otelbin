#!/usr/bin/env bash

# Prints how many releases per distribution the validation stack should deploy, as a value for
# MAX_RELEASES_PER_DISTRIBUTION (see packages/otelbin-validation/src/distributions.ts). An empty
# value means "no cap".
#
# Production deploys every release in supported-distributions.json: the version picker in the
# web app is populated from what the deployed stack serves, so capping it there would remove
# versions users can validate against.
#
# Preview environments deploy only the newest few per distribution. Each release costs a Docker
# image build, a Lambda, and an API Gateway resource, method and permission, and a pull request
# can only regress the validation image or the Lambda plumbing - code that is identical for
# every (frozen) collector release. The remaining ~90 releases per pull request re-test the same
# path. The full set still runs on every push to main.
#
# Required env var: TEST_ENVIRONMENT_NAME (as produced by test_env_name.sh).

set -euo pipefail

: "${TEST_ENVIRONMENT_NAME:?TEST_ENVIRONMENT_NAME must be set}"

PREVIEW_RELEASE_CAP=5

if [[ "${TEST_ENVIRONMENT_NAME}" == 'main' ]]; then
    echo ''
else
    echo "${PREVIEW_RELEASE_CAP}"
fi
