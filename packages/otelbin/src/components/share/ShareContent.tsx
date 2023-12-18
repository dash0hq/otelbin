// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { SignInButton, useAuth } from "@clerk/nextjs";
import { Button } from "~/components/button";
import { ArrowDownToLine, Copy, LogIn } from "lucide-react";
import { useUrlState } from "~/lib/urlState/client/useUrlState";
import { editorBinding } from "~/components/monaco-editor/editorBinding";
import { UrlCopy } from "~/components/share/UrlCopy";
import { DownloadImageButton } from "~/components/share/DownloadImageButton";
import { track } from "@vercel/analytics";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/tooltip";
import { IconButton } from "~/components/icon-button";
import { useToast } from "~/components/use-toast";
import { fetcher } from "~/lib/fetcher";
import useSWRImmutable from "swr/immutable";

export function ShareContent() {
	const { toast } = useToast();
	const [{ config }, getLink] = useUrlState([editorBinding]);
	let fullURL = window.location.origin + getLink({});
	const { isSignedIn } = useAuth();

	const { data } = useSWRImmutable<{ shortLink: string }>(
		isSignedIn
			? {
					url: `/s/new`,
					method: "POST",
					body: fullURL,
				}
			: undefined,
		fetcher
	);

	fullURL = data?.shortLink ?? fullURL;

	return (
		<div>
			<p className="weight mx-4 mt-3 mb-2 text-sm font-normal text-default">Share the config with others.</p>
			<UrlCopy url={fullURL} />
			{!isSignedIn && (
				<SignInButton mode="modal" afterSignInUrl="/restore">
					<Button size="xs" variant="cta" className="mx-4 mt-3">
						<LogIn className="mr-1" />
						Sign in to create short URL
					</Button>
				</SignInButton>
			)}

			{isSignedIn && (
				<div className="mt-3 border-t-1 border-subtle px-4 pt-3">
					<p className="weight mb-2 text-sm font-normal text-default">Link to this configuration with a badge.</p>

					<div className="flex gap-2 items-center">
						<img
							src="/badges/collector-config"
							alt="OpenTelemetry collector configuration on OTelBin"
							width={167}
							height={20}
							className="max-h-[20px] grow-0"
						/>
						<Tooltip>
							<TooltipTrigger asChild>
								<IconButton size="xs" onClick={copyToClipboard}>
									<Copy />
								</IconButton>
							</TooltipTrigger>
							<TooltipContent>Copy badge markdown to clipboard</TooltipContent>
						</Tooltip>
					</div>
				</div>
			)}

			<div className="mt-4 border-t-1 border-subtle px-4 py-3">
				<Button asChild size="xs" className="mr-2">
					<a
						href={`data:text/plain;base64,${btoa(config)}`}
						download="config.yaml"
						onClick={() => track("Download Config", { location: "Share" })}
					>
						<ArrowDownToLine className="mr-1" />
						Download YAML
					</a>
				</Button>
				<DownloadImageButton />
			</div>
		</div>
	);

	function copyToClipboard() {
		const text = `[![OpenTelemetry collector configuration on OTelBin](${
			window.location.origin + "/badges/collector-config"
		})](${fullURL})`;
		navigator.clipboard
			.writeText(text)
			.then(() => {
				toast({
					description: "Copied to clipboard.",
				});
			})
			.catch((e) => {
				console.error("Failed to copy to clipboard", e);
				toast({
					description: "Failed to copy to clipboard",
				});
			});
		track("Copied badge markdown");
	}
}
