#!/usr/bin/env bash

# Tear down the validation backend CDK stack with rate-limit-aware retries.
#
# CloudFormation can hit Lambda `Rate exceeded` errors when deleting the many
# per-distro Lambda functions in parallel, leaving the stack in DELETE_FAILED.
# CDK refuses to continue from that state, so on failure we fall back to
# `aws cloudformation delete-stack` directly -- CloudFormation retries only
# the failed resources, and by then the Lambda rate-limit window has cleared.
#
# Required env vars: TEST_ENVIRONMENT_NAME (plus AWS_* / CDK_* for the tools).
# Run from the repo root.

set -uo pipefail

: "${TEST_ENVIRONMENT_NAME:?TEST_ENVIRONMENT_NAME must be set}"

ROOT_STACK="otelbin-validation-${TEST_ENVIRONMENT_NAME}"

if (cd packages/otelbin-validation && npx projen destroy --force); then
    echo "cdk destroy succeeded."
    exit 0
fi
echo "cdk destroy failed; falling back to direct CloudFormation deletion of ${ROOT_STACK}."

stack_exists() {
    aws cloudformation describe-stacks --stack-name "${ROOT_STACK}" >/dev/null 2>&1
}

for attempt in 1 2 3; do
    if ! stack_exists; then
        echo "Stack ${ROOT_STACK} deleted before attempt ${attempt}."
        exit 0
    fi

    echo "Attempt ${attempt}: re-issuing delete-stack for ${ROOT_STACK}."
    aws cloudformation delete-stack --stack-name "${ROOT_STACK}"

    if aws cloudformation wait stack-delete-complete --stack-name "${ROOT_STACK}"; then
        echo "Stack ${ROOT_STACK} deleted on attempt ${attempt}."
        exit 0
    fi

    echo "Stack ${ROOT_STACK} did not reach DELETE_COMPLETE on attempt ${attempt}."
    backoff=$((60 * attempt))
    echo "Backing off ${backoff}s before retrying."
    sleep "${backoff}"
done

echo "Failed to delete ${ROOT_STACK} after 3 attempts -- manual cleanup required."
aws cloudformation describe-stack-events --stack-name "${ROOT_STACK}" \
    --no-paginate --query 'StackEvents[:20]' --output table || true
exit 1
