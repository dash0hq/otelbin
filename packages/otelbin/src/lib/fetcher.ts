// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

export interface FetcherArgs {
	url: string;
	method: string;
	body?: string;
}

export const fetcher = (args: FetcherArgs) =>
	fetch(args.url, {
		method: args.method,
		body: args.body,
	}).then((res) => res.json());
