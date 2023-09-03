// SPDX-FileCopyrightText: Copyright 2023 Dash0 Inc.

import type { Binding } from "~/lib/urlState/binding";
import type { Bindings } from "~/lib/urlState/typeMapping";
import type { ReadonlyURLSearchParams } from "next/navigation";
import { parse } from "./jsurl2";

export function parseUrlState<T extends Binding<unknown>[]>(
	usp: ReadonlyURLSearchParams | URLSearchParams,
	bindings: T
): Bindings<T> {
	const result: Record<string, unknown> = {};
	for (const binding of bindings) {
		const searchParamName = binding.prefix + binding.name;
		const searchParamValue = usp.get(searchParamName);
		let value = binding.fallback;
		if (searchParamValue != null) {
			try {
				value = parse(searchParamValue);
			} catch (e) {
				console.warn("Failed to parse search param %s.", searchParamName, e);
			}
		}
		result[binding.name] = value;
	}

	return result as Bindings<T>;
}
