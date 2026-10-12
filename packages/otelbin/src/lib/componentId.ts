// SPDX-FileCopyrightText: 2026 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

export interface ComponentIdParts {
	type: string;
	name?: string;
}

/**
 * Splits an OpenTelemetry component ID at its first slash.
 *
 * The Collector represents IDs as `type[/name]`. Slashes are valid inside the
 * optional name, so splitting on every slash would discard part of the name.
 */
export function splitComponentId(id: string): ComponentIdParts {
	const separatorIndex = id.indexOf("/");
	if (separatorIndex === -1) {
		return { type: id };
	}

	return {
		type: id.slice(0, separatorIndex),
		name: id.slice(separatorIndex + 1),
	};
}
