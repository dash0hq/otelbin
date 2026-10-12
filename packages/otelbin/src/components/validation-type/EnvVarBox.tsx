// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { AlertTriangle, Braces } from "lucide-react";
import { useEnvVarPanel } from "~/contexts/EditorContext";
import { useEnvVars } from "~/components/env-vars/useEnvVars";

/**
 * Summarizes the state of the configuration's variable substitutions next to
 * the validation picker, and opens the panel that binds values to them.
 */
export default function EnvVarBox() {
	const { bindings, blockers } = useEnvVars();
	const { isEnvVarPanelOpen, setEnvVarPanelOpen } = useEnvVarPanel();

	const count = Object.keys(bindings).length;
	if (count === 0) {
		return null;
	}

	const isBlocking = blockers.length > 0;

	return (
		<button
			type="button"
			onClick={() => setEnvVarPanelOpen(!isEnvVarPanelOpen)}
			title={isBlocking ? blockers.join(". ") : undefined}
			className={`flex h-6 items-center gap-x-1 rounded-md px-2 ${isBlocking ? "bg-red-950" : "bg-neutral-250"}`}
		>
			{isBlocking ? (
				<AlertTriangle height={12} className="text-red-400" />
			) : (
				<Braces height={12} className="text-orange-400" />
			)}
			<p className="text-xs font-normal">
				{isBlocking
					? `Validation disabled: ${blockers.join(". ")}`
					: `${count} environment ${count === 1 ? "variable" : "variables"}`}
			</p>
		</button>
	);
}
