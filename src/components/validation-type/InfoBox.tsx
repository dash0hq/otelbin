// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { IconButton } from "../icon-button";
import { AlertCircle, X } from "lucide-react";

export default function InfoBox() {
	const [open, setOpen] = useState(true);

	function handleClose() {
		setOpen(false);
	}
	return (
		open && (
			<div className="px-2 h-6 flex items-center  gap-x-1 bg-neutral-250 rounded-md">
				<AlertCircle height={12} />
				<p className="text-xs font-normal">Try the improved, distribution-specific validation.</p>
				<IconButton onClick={handleClose} variant={"transparent"} size={"xs"}>
					<X height={12} />
				</IconButton>
			</div>
		)
	);
}
