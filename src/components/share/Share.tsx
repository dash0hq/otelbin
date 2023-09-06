// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

"use client";

import { Share2 } from "lucide-react";
import { Button } from "@dash0/components/ui/button";
// import { useToast } from "@dash0/components/ui/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@dash0/components/ui/popover";
import { ShareContent } from "~/components/share/ShareContent";

export function Share() {
	// const { toast } = useToast();

	// async function handleShare() {
	// 	await navigator.clipboard.writeText(window.location.href);
	// 	toast({
	// 		description: "URL copied to clipboard.",
	// 	});
	// }

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
