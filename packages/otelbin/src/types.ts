// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

export interface Distributions {
	[id: string]: Distribution;
}

export interface Distribution {
	name: string;
	provider: string;
	description: string;
	icon: string;
	website: string;
	repository: string;
	releases: Release[];
}

export interface Release {
	version: string;
	artifact: string;
}

export interface ServerSideValidationResult {
	message: string;
	error: string;
	path?: string[];
}
