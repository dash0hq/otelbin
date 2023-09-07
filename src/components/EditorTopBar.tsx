// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { IconButton } from "@dash0hq/ui/src/components/ui/icon-button";
import { useToast } from "@dash0hq/ui/src/components/ui/use-toast";
import { ArrowDownToLine, Copy } from "lucide-react";

export default function EditorTopBar({ config }: { config: string }) {
	const { toast } = useToast();

	function handleDownload() {
		const blob = new Blob([config], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.download = "config.yaml";
		link.href = url;
		link.click();
	}

	function handleCopy() {
		navigator.clipboard
			.writeText(config)
			.then(() => {
				toast({
					description: "Config copied to clipboard.",
				});
			})
			.catch((e) => {
				console.error("Failed to copy to clipboard", e);
				toast({
					description: "Failed to copy to clipboard",
				});
			});
	}

	return (
		<div className="flex shrink-0 items-center justify-between bg-default p-1 shadow-none">
			<div>TODO path</div>
			<div>
				<IconButton onClick={handleCopy} variant={"transparent"} size={"xs"}>
					<Copy />
				</IconButton>
				<IconButton onClick={handleDownload} variant={"transparent"} size={"xs"}>
					<ArrowDownToLine />
				</IconButton>
			</div>
		</div>
	);
}
