// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { type IError } from "~/components/monaco-editor/ErrorConsole";
import { type ValidationState } from "~/components/validation/useServerSideValidation";
import { useState } from "react";
import { useUrlState } from "~/lib/urlState/client/useUrlState";
import { editorBinding } from "~/components/monaco-editor/editorBinding";

interface UseFixArgs {
	errors?: IError;
	serverSideValidationState: ValidationState;
}

interface InternalState {
	// the config that was/is being fixed
	config: string;
	indication: UseFixIndication;

	// TODO remove
	// lastTrigger?: Date;
	// lastFixCompletionTime?: Date;
}

export type UseFixIndication = "hidden" | "trigger" | "pending" | "done" | "error";

export type UseFixResult = [UseFixIndication, () => void];

const initialInternalState: InternalState = {
	config: "",
	indication: "hidden",
};

export function useFix(args: UseFixArgs): UseFixResult {
	const [{ config }, getLink] = useUrlState([editorBinding]);
	const [{ indication }, setState] = useState<InternalState>(initialInternalState);

	const issues = stringifyIssues(args);
	return [indication === "trigger" && (issues === "" || config.trim() === "") ? "hidden" : indication, trigger];

	async function trigger() {
		setState({
			config,
			indication: "pending",
		});

		try {
			const resp = await fetch("/validation/fix", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					config,
					issues,
				}),
			});

			if (!resp.ok) {
				const body = await resp.text();
				throw new Error(`Unexpected status code: ${resp.status}: ${body}`);
			}

			const { config: fixedConfig, explanation } = (await resp.json()) as { config: string; explanation: string };
			console.log({ fixedConfig, explanation });
			console.log({ url: getLink({ config: fixedConfig }) });
			// setState((s) => {
			// 	if (s.config !== config) {
			// 		return s;
			// 	}
			// 	return {
			// 		config,
			// 		indication: "done",
			// 	};
			// });
			// TODO do not push when out of date
			window.history.pushState(null, "", getLink({ config: fixedConfig }));
		} catch (e) {
			console.error(e);
			// TODO reset error state eventually
			// TODO not when out of date
			setState({
				config,
				indication: "error",
			});
		}
	}
}

function stringifyIssues({ serverSideValidationState, errors }: UseFixArgs): string {
	const issues: string[] = [];

	if (serverSideValidationState.result?.error) {
		issues.push(serverSideValidationState.result.error);
	}

	if (errors?.jsYamlError?.reason) {
		issues.push(`${errors.jsYamlError.reason} (${errors.jsYamlError.mark})`);
	}

	errors?.ajvErrors?.forEach((e) => {
		issues.push(e.message);
	});

	if (errors?.customErrors) {
		issues.push(...errors?.customErrors);
	}

	if (errors?.customWarnings) {
		issues.push(...errors?.customWarnings);
	}

	issues.sort((a, b) => a.localeCompare(b));

	return issues.join("\n\n").trim();
}
