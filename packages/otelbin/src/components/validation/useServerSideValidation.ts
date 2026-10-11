// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

"use client";

import { debounce } from "lodash";
import { useUrlState } from "~/lib/urlState/client/useUrlState";
import { distroBinding, distroVersionBinding, envVarBinding } from "~/components/validation/binding";
import { editorBinding } from "~/components/monaco-editor/editorBinding";
import { useEffect, useMemo, useState } from "react";
import { type ServerSideValidationResult } from "~/types";
import { useEnvVars } from "~/components/env-vars/useEnvVars";

export interface ValidationState {
	isLoading: boolean;
	// the config that was/is being validated
	config: string;
	// the distro that was/is being validated
	distro: string | null;
	// the distroVersion that was/is being validated
	distroVersion: string | null;
	result: ServerSideValidationResult | null;
	/**
	 * Reasons why the configuration could not be sent for validation, for
	 * instance because it references an environment variable without a value.
	 * Empty whenever validation did run.
	 */
	blockers: string[];
}

const initialValidationState: ValidationState = {
	isLoading: false,
	config: "",
	distro: null,
	distroVersion: null,
	result: null,
	blockers: [],
};

export function useServerSideValidation(): ValidationState {
	const [{ config, distro, distroVersion, env }] = useUrlState([
		distroBinding,
		distroVersionBinding,
		editorBinding,
		envVarBinding,
	]);
	const [state, setState] = useState<ValidationState>(initialValidationState);
	const { blockers } = useEnvVars();
	// The collector resolves substitutions before it parses the configuration, so
	// sending one it cannot resolve only ever yields an error about the
	// substitution itself, masking any real problem with the configuration.
	const isBlocked = blockers.length > 0;
	// `useUrlState` hands back a freshly parsed object on every render. Keying the
	// debounced function on the serialized form instead keeps it from being
	// rebuilt — and its pending call dropped — on every render.
	const envKey = JSON.stringify(env);

	const validate = useMemo(() => {
		const env = JSON.parse(envKey) as Record<string, string>;

		return debounce(
			async (config: string) => {
				if (!distro || !distroVersion) {
					return;
				}

				let newState: ValidationState;
				try {
					const response = await fetch(
						`/validation?distro=${encodeURIComponent(distro)}&version=${encodeURIComponent(distroVersion)}`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
								Accept: "application/json",
							},
							body: JSON.stringify({
								config,
								env,
							}),
						}
					);

					const result = (await response.json()) as ServerSideValidationResult;
					newState = {
						isLoading: false,
						config,
						distro,
						distroVersion,
						result,
						blockers: [],
					};
				} catch (e) {
					newState = {
						isLoading: false,
						config,
						distro,
						distroVersion,
						result: null,
						blockers: [],
					};
				}

				setState((oldState) => {
					if (
						oldState.config === newState.config ||
						oldState.distro === newState.distro ||
						oldState.distroVersion === newState.distroVersion
					) {
						return newState;
					}
					return oldState;
				});
			},
			2000,
			{
				leading: true,
				trailing: true,
			}
		);
	}, [distro, distroVersion, envKey]);

	useEffect(() => {
		if (!distro || !distroVersion) {
			setState(initialValidationState);
			return;
		}

		if (isBlocked) {
			validate.cancel();
			setState({
				isLoading: false,
				config,
				distro,
				distroVersion,
				result: null,
				blockers,
			});
			return;
		}

		setState({
			isLoading: true,
			config,
			distro,
			distroVersion,
			result: null,
			blockers: [],
		});

		validate(config).catch((e) => console.error(e));
	}, [config, distro, distroVersion, validate, isBlocked, blockers]);

	return state;
}
