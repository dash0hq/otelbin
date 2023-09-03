import { Input } from "@dash0/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@dash0/components/ui/tooltip";
import { IconButton } from "@dash0/components/ui/icon-button";
import { Copy } from "lucide-react";
import { useToast } from "@dash0/components/ui/use-toast";

export interface UrlCopyProps {
	url: string;
}
export function UrlCopy({ url }: UrlCopyProps) {
	const { toast } = useToast();

	return (
		<div className="mx-4 flex gap-2">
			<Input type="url" readOnly value={url} size="xs" />
			<Tooltip>
				<TooltipTrigger asChild>
					<IconButton size="xs" onClick={copyToClipboard}>
						<Copy />
					</IconButton>
				</TooltipTrigger>
				<TooltipContent>Copy URL to clipboard</TooltipContent>
			</Tooltip>
		</div>
	);

	function copyToClipboard() {
		navigator.clipboard
			.writeText(url)
			.then(() => {
				toast({
					description: "URL copied to clipboard.",
				});
			})
			.catch((e) => {
				console.error("Failed to copy to clipboard", e);
				toast({
					description: "Failed to copy to clipboard",
				});
			});
	}
}
