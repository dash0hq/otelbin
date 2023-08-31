// SPDX-FileCopyrightText: Copyright 2023 Dash0 Inc.

"use client";

import type { Bindings } from "~/lib/urlState/typeMapping";
import type { Binding } from "~/lib/urlState/binding";
import { usePathname, useSearchParams } from "next/navigation";
import { parseUrlState } from "~/lib/urlState/parseUrlState";
import { serializeUrlState } from "~/lib/urlState/serializeUrlState";
import { useCallback, useMemo } from "react";

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
export function useUrlState<T extends Binding<any>[]>(
    binds: T
): [
    Bindings<T>,
    (newUrlState: Partial<Bindings<T>>, pathName?: string) => string
] {
    const searchParams = useSearchParams();
    const pathName = usePathname();

    const urlState = useMemo(
        () => parseUrlState(searchParams, binds),
        [searchParams, binds]
    );

    const getLink = useCallback(
        function getLink(
            newUrlState: Partial<Bindings<T>>,
            newPathName?: string
        ): string {
            return serializeUrlState(
                binds,
                newPathName ?? pathName,
                searchParams,
                {
                    // @ts-expect-error TypeScript is confused
                    ...urlState,
                    ...newUrlState,
                }
            );
        },
        [searchParams, binds, pathName, urlState]
    );

    return [urlState, getLink];
}
