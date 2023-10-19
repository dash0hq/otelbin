// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { SignedIn, SignedOut, SignInButton } from "@clerk/nextjs";
import { Button } from "~/components/button";
import { ArrowDownToLine, LogIn } from "lucide-react";
import { useUrlState } from "~/lib/urlState/client/useUrlState";
import { editorBinding } from "~/components/monaco-editor/editorBinding";
import { UrlCopy } from "~/components/share/UrlCopy";
import { SignedInUrlSharing } from "~/components/share/SignedInUrlSharing";
import { track } from "@vercel/analytics";

export function ShareContent() {
	const [{ config }, getLink] = useUrlState([editorBinding]);
	const fullURL = window.location.origin + getLink({});

	return (
		<div>
			<p className="weight mx-4 my-3 text-sm font-normal text-default">Use the URL to share the config with others.</p>

			<SignedIn>
				<SignedInUrlSharing fullURL={fullURL} />
			</SignedIn>
			<SignedOut>
				<UrlCopy url={fullURL} />

				<SignInButton mode="modal" afterSignInUrl="/restore">
					<Button size="xs" variant="cta" className="mx-4 mt-3">
						<LogIn className="mr-1" />
						Sign in to create short URL
					</Button>
				</SignInButton>
			</SignedOut>

			<div className="mt-3 border-t-1 border-subtle px-4 py-3">
				<Button asChild size="xs">
					<a href={`data:text/plain;base64,${btoa(config)}`} download="config.yaml" onClick={() => track("Download Config", { location: "Share" })}>
						<ArrowDownToLine className="mr-1" />
						Download YAML
					</a>
				</Button>
			</div>
		</div>
	);
}
