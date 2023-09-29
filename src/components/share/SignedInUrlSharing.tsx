// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import useSWR from "swr";
import { UrlCopy } from "~/components/share/UrlCopy";

interface FetcherArgs {
	url: string;
	method: string;
	body?: string;
}

const fetcher = (args: FetcherArgs) =>
	fetch(args.url, {
		method: args.method,
		body: args.body,
	}).then((res) => res.json());

export interface SignedInUrlSharingProps {
	fullURL: string;
}

export function SignedInUrlSharing({ fullURL }: SignedInUrlSharingProps) {
	const { data } = useSWR<{ shortLink: string }>(
		{
			url: `/s/new`,
			method: "POST",
			body: fullURL,
		},
		fetcher
	);
	return <UrlCopy url={data?.shortLink ?? fullURL} />;
}
