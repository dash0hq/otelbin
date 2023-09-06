// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

export function getShortLinkPersistenceKey(uuid: string): string {
	return `sl_${uuid}`;
}
