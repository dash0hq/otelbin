// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { IconButton } from "~/components/icon-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/tooltip";
import { useToast } from "~/components/use-toast";
import { ArrowDownToLine, Copy } from "lucide-react";
import { type NextFont } from "next/dist/compiled/@next/font";
import { useBreadcrumbs } from "~/contexts/EditorContext";
import { track } from "@vercel/analytics";

export default function EditorTopBar({ config, font }: { config: string; font: NextFont }) {
	const { toast } = useToast();
	const { path } = useBreadcrumbs();

	function handleDownload() {
		const blob = new Blob([config], { type: "text/plain" });
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.download = "config.yaml";
		link.href = url;
		link.click();
		track("Download Config", { location: "Editor" });
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
		track("Copied Config To Clipboard");
	}

	return (
		<div className="flex shrink-0 items-center justify-between bg-default pl-4 pr-1 shadow-none">
			<Tooltip>
				<TooltipTrigger asChild>
					<div
						style={{ direction: "rtl" }}
						className={`overflow-hidden text-left whitespace-nowrap overflow-ellipsis w-[80%] text-neutral-500 font-normal text-[12px] ${font.className}`}
					>
						{path.slice(2)}
					</div>
				</TooltipTrigger>
				<TooltipContent>{path.slice(2)}</TooltipContent>
			</Tooltip>
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
