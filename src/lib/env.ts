// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

export function assertValue<T>(v: T | undefined, errorMessage: string): T {
	if (v === undefined) {
		throw new Error(errorMessage);
	}

	return v;
}
