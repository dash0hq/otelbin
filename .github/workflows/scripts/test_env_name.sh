#!/usr/bin/env bash

# Ensure test name is not long enough to break restrictions on length names in AWS (e.g., role-name length)
# This logic ensures test envs have max length 18. Names of length 13 to 17 will become of length 18 to ensure
# no accidental clashes.
if [[ ${#REF_NAME} -gt 12 ]]; then
    REF_NAME="${REF_NAME:0:12}-$(echo "${REF_NAME:12}" | md5sum | awk '{print $1}' | tr '_' '-' | cut -c 1-5 | tr -d '\n')"
fi

# Check if REF_NAME starts with "dependabot/" and if so, replace "dependabot/" with "dependabot-"
# This should fix the following error:
#   Error: Invalid S3 bucket name (value: supported-distributions-list-dependabot/n-059e9)
#   Bucket name must only contain lowercase characters and the symbols, period (.) and dash (-) (offset: 39)
if [[ "${REF_NAME}" == dependabot/* ]]; then
    REF_NAME="${REF_NAME/dependabot\//dependabot-}"
fi

echo "${REF_NAME}"
