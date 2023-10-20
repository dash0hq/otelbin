// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import useSWR from "swr";
import { type Distributions } from "~/types";
import { fetcher } from "~/lib/fetcher";

export function useDistributions() {
	return useSWR<Distributions>(
		{
			url: `validation/supported-distributions`,
			method: "GET",
		},
		fetcher
	);
}
