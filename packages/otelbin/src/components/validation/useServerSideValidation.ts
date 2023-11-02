// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

"use client";

import { debounce } from "lodash";
import { useUrlState } from "~/lib/urlState/client/useUrlState";
import { distroBinding, distroVersionBinding } from "~/components/validation/binding";
import { editorBinding } from "~/components/monaco-editor/editorBinding";
import { useEffect, useMemo, useState } from "react";
import { type ServerSideValidationResult } from "~/types";

export interface ValidationState {
	isLoading: boolean;
	// the config that was/is being validated
	config: string;
	// the distro that was/is being validated
	distro: string | null;
	// the distroVersion that was/is being validated
	distroVersion: string | null;
	result: ServerSideValidationResult | null;
}

const initialValidationState: ValidationState = {
	isLoading: false,
	config: "",
	distro: null,
	distroVersion: null,
	result: null,
};

export function useServerSideValidation(): ValidationState {
	const [{ config, distro, distroVersion }] = useUrlState([distroBinding, distroVersionBinding, editorBinding]);
	const [state, setState] = useState<ValidationState>(initialValidationState);

	const validate = useMemo(
		() =>
			debounce(
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
								body: config,
							}
						);

						const result = (await response.json()) as ServerSideValidationResult;
						newState = {
							isLoading: false,
							config,
							distro,
							distroVersion,
							result,
						};
					} catch (e) {
						newState = {
							isLoading: false,
							config,
							distro,
							distroVersion,
							result: null,
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
			),
		[distro, distroVersion]
	);

	useEffect(() => {
		if (!distro || !distroVersion) {
			setState(initialValidationState);
			return;
		}

		setState({
			isLoading: true,
			config,
			distro,
			distroVersion,
			result: null,
		});

		validate(config).catch((e) => console.error(e));
	}, [config, distro, distroVersion, validate]);

	return state;
}
