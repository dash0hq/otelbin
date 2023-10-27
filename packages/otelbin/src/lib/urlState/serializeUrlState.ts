// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import type { Binding } from "~/lib/urlState/binding";
import type { Bindings } from "~/lib/urlState/typeMapping";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { stringify } from "./jsurl2";

export function serializeUrlState<T extends Binding<unknown>[]>(
	bindings: T,
	pathName: string,
	searchParams: URLSearchParams | ReadonlyURLSearchParams,
	currentHashSearchParams: URLSearchParams | ReadonlyURLSearchParams,
	urlState: Partial<Bindings<T>>
): string {
	const usp = new URLSearchParams(currentHashSearchParams.toString());

	for (const binding of bindings) {
		const searchParamName = binding.prefix + binding.name;

		if (!urlState.hasOwnProperty(binding.name)) {
			usp.delete(searchParamName);
			continue;
		}

		const searchParamValue = (urlState as never)[binding.name];
		try {
			usp.set(searchParamName, stringify(searchParamValue));
		} catch (e) {
			console.warn("Failed to serialize search param %s.", searchParamName, e);
		}
	}

	return pathName + "?" + searchParams.toString() + "#" + usp.toString();
}
