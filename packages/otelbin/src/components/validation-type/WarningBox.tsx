// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { AlertTriangle } from "lucide-react";

export default function WarningBox({ unboundVariables }: { unboundVariables: number }) {
	return (
		<div className="px-2 h-6 flex items-center  gap-x-1 rounded-md bg-red-950">
			<AlertTriangle height={12} className="text-red-600" />
			<p className="text-xs font-normal underline">{`Validation disabled: ${unboundVariables} environment variable is unbound`}</p>
		</div>
	);
}
