// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import useSWR from "swr";
import { UrlCopy } from "~/components/share/UrlCopy";
import { fetcher } from "~/lib/fetcher";

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
