// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

"use client";

import { useMemo } from "react";
import { useUrlState } from "~/lib/urlState/client/useUrlState";
import { editorBinding } from "~/components/monaco-editor/editorBinding";
import { envVarBinding } from "~/components/validation/binding";
import {
	bindEnvVars,
	findSubstitutions,
	findValidationBlockers,
	type IEnvVarBinding,
	type IUnsupportedProvider,
} from "~/components/monaco-editor/envVars";

export interface IEnvVarsState {
	/** Every environment variable the configuration references, keyed by name. */
	bindings: Record<string, IEnvVarBinding>;
	/** Variables that need a value from the user before validation can run. */
	unbound: IEnvVarBinding[];
	/** Substitutions resolved by a provider we cannot emulate server-side. */
	unsupportedProviders: IUnsupportedProvider[];
	/** Human-readable reasons why server-side validation cannot run. */
	blockers: string[];
	/** Whether the configuration references anything that needs binding. */
	hasEnvVars: boolean;
}

/**
 * Reads the configuration and the bound values from the URL state and derives
 * everything the UI needs to know about variable substitution.
 */
export function useEnvVars(): IEnvVarsState {
	const [{ config, env }] = useUrlState([editorBinding, envVarBinding]);

	// `useUrlState` hands back a freshly parsed object on every render, so the
	// serialized form is what we can actually memoize on.
	const envKey = JSON.stringify(env);

	return useMemo(() => {
		const { envVars, unsupportedProviders } = findSubstitutions(config);
		const bindings = bindEnvVars(envVars, JSON.parse(envKey) as Record<string, string>);
		const unbound = Object.values(bindings).filter((binding) => binding.isUnbound);

		return {
			bindings,
			unbound,
			unsupportedProviders,
			blockers: findValidationBlockers(bindings, unsupportedProviders),
			hasEnvVars: Object.keys(bindings).length > 0,
		};
	}, [config, envKey]);
}
