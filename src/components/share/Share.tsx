// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

"use client";

import { Share2 } from "lucide-react";
import { Button } from "~/components/button";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/popover";
import { ShareContent } from "~/components/share/ShareContent";

export function Share() {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="cta" size="xs">
					<Share2 className="-ml-1" />
					Share
				</Button>
			</PopoverTrigger>
			<PopoverContent align="end" className="p-0">
				<ShareContent />
			</PopoverContent>
		</Popover>
	);
}
