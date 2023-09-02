import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "@dash0hq/ui/src/components/ui/button";
import { ArrowDownToLine, Copy, LogIn } from "lucide-react";
import { useUrlState } from "~/lib/urlState/client/useUrlState";
import { editorBinding } from "~/components/monaco-editor/editorBinding";
import { Input } from "@dash0/components/ui/input";
import { IconButton } from "@dash0hq/ui/src/components/ui/icon-button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@dash0/components/ui/tooltip";
import { useToast } from "@dash0hq/ui/src/components/ui/use-toast";

export function ShareContent() {
	const { toast } = useToast();
	const [{ config }, getLink] = useUrlState([editorBinding]);
	const fullURL = window.location.origin + getLink({});

	function copyToClipboard() {
		navigator.clipboard
			.writeText(fullURL)
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

	return (
		<div>
			<p className="weight mx-4 my-3 text-sm font-normal text-default">Use the URL to share the config with others.</p>

			<SignedIn>TODO add support for short URLs</SignedIn>
			<SignedOut>
				<div className="mx-4 flex gap-2">
					<Input type="url" readOnly value={fullURL} size="xs" />
					<Tooltip>
						<TooltipTrigger asChild>
							<IconButton size="xs" onClick={copyToClipboard}>
								<Copy />
							</IconButton>
						</TooltipTrigger>
						<TooltipContent>Copy URL to clipboard</TooltipContent>
					</Tooltip>
				</div>

				<SignInButton mode="modal" afterSignInUrl={fullURL}>
					<Button size="xs" variant="cta" className="mx-4 mt-3">
						<LogIn className="mr-1" />
						Sign in to create short URL
					</Button>
				</SignInButton>
			</SignedOut>

			<div className="mt-3 border-t-1 border-subtle px-4 py-3">
				<Button asChild size="xs">
					<a href={`data:text/plain;base64,${btoa(config)}`} download="config.yaml">
						<ArrowDownToLine className="mr-1" />
						Download YAML
					</a>
				</Button>
			</div>
		</div>
	);
}
