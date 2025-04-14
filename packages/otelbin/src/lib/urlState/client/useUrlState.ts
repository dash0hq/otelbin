// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

"use client";

import type { Bindings } from "~/lib/urlState/typeMapping";
import type { Binding } from "~/lib/urlState/binding";
import { usePathname, useSearchParams } from "next/navigation";
import { parseUrlState } from "~/lib/urlState/parseUrlState";
import { serializeUrlState } from "~/lib/urlState/serializeUrlState";
import { useCallback, useMemo } from "react";
import { useHashSearchParams } from "~/lib/urlState/client/useHashSearchParams";

export const dynamic = 'force-dynamic'

/**
 * A hook similar to useState that can be used to read&store state within the
 * URL as query parameters.
 *
 * Usage example
 * const [state, getLink] = useUrlState([fromBinding, toBinding]);
 *
 * console.log(state);                    // {from: 'now-10m', to: 'now'}
 * console.log(getLink({from: 'now-20m'}) // /something?from=now-20m&to=now
 */
export function useUrlState<T extends Binding<unknown>[]>(
	binds: T
): [Bindings<T>, (newUrlState: Partial<Bindings<T>>, pathName?: string) => string] {
	const pathName = usePathname();
	const searchParams = useSearchParams();
	const hashSearchParams = useHashSearchParams();

	const urlState = useMemo(() => parseUrlState(hashSearchParams, binds), [hashSearchParams, binds]);

	const getLink = useCallback(
		function getLink(newUrlState: Partial<Bindings<T>>, newPathName?: string): string {
			return serializeUrlState(binds, newPathName ?? pathName, searchParams, hashSearchParams, {
				// @ts-expect-error TypeScript is confused
				...urlState,
				...newUrlState,
			});
		},
		[hashSearchParams, searchParams, binds, pathName, urlState]
	);

	return [urlState, getLink];
}
