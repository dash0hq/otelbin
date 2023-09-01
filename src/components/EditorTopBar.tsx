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
		<div className="absolute right-2 top-2 z-10 flex items-center justify-end shadow-none">
			<IconButton
				onClick={handleCopy}
				className="min-w-[97px] bg-[#1E1E1E] shadow-none"
				variant={"default"}
				size={"sm"}
			>
				<Copy className="mr-2" />
				Copy
			</IconButton>
			<IconButton
				onClick={handleDownload}
				className="min-w-[97px] bg-[#1E1E1E] shadow-none"
				variant={"default"}
				size={"sm"}
			>
				<ArrowDownToLine className="mr-2" />
				Download
			</IconButton>
		</div>
	);
}
