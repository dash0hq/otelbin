// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { Popover, PopoverContent, PopoverTrigger } from "~/components/popover";
import { Scale } from "lucide-react";
import { legalDocuments } from "~/components/legal/legalDocuments";
import { LegalContent } from "~/components/legal/LegalContent";

export function Legal() {
	const hasAtLeastOneLegalDocumentConfigured = legalDocuments.some((doc) => Boolean(doc.url));
	if (!hasAtLeastOneLegalDocumentConfigured) {
		return null;
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<div className="flex cursor-pointer items-center gap-1 transition-colors hover:text-default">
					<Scale size="0.875rem" />
					Legal
				</div>
			</PopoverTrigger>
			<PopoverContent align="end" className="p-0">
				<LegalContent />
			</PopoverContent>
		</Popover>
	);
}
