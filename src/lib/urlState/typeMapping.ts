// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import type { Binding } from "~/lib/urlState/binding";

type WidenType<T> = T extends string ? string : T extends number ? number : T extends boolean ? boolean : T;

type ToObject<T> = T extends Binding<infer ValueType> ? { [P in T["name"]]: WidenType<ValueType> } : never;

type ToObjectsArray<T> = {
	[I in keyof T]: ToObject<T[I]>;
};

type UnionToIntersection<U> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

export type Bindings<ArrayBindings> = UnionToIntersection<
	// @ts-expect-error This actually works, but somehow the TypeScript compiler doesn't think so.
	ToObjectsArray<ArrayBindings>[number]
>;
