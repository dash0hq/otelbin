// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

/*
 * Note, in order for TypeScript to properly generate type definitions, you need
 * to help it out. Specifically:
 *  - mark bindings as const
 *  - widen the fallback type in case it is not a primitive value
 *
 * Example showing const definition
 *   export const refreshBinding = {
 *     prefix: "settings",
 *     name: "refresh",
 *     fallback: false,
 *   } as const;
 *
 * And here is an example showing type widening to a fictitious type User
 *   export const userBinding = {
 *     prefix: "settings",
 *     name: "user",
 *     fallback: {} as User,
 *   } as const;
 *
 * In cases where there is no suitable fallback, you need to do the following:
 *   export const userBinding = {
 *     prefix: "settings",
 *     name: "user",
 *     fallback: null as null | User,
 *   } as const;
 */
export interface Binding<Fallback> {
	// The prefix will be prepended to 'name'. Useful to avoid search parameter
	// name conflicts.
	prefix: string;
	name: string;
	// Note that the fallback's type must match the type of the values persisted
	// in the URL. Furthermore, the value must be JSON serializable.
	fallback: Fallback;
}
