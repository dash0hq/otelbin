// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

"use client";

import { ArrowDownToLine } from "lucide-react";
import { track } from "@vercel/analytics";
import { Button } from "~/components/button";
import { DownloadImageButton } from "~/components/share/DownloadImageButton";
import { UrlCopy } from "~/components/share/UrlCopy";
import { editorBinding } from "~/components/monaco-editor/editorBinding";
import { useUrlState } from "~/lib/urlState/client/useUrlState";

export function BasicShareContent() {
	const [{ config }, getLink] = useUrlState([editorBinding]);
	const fullURL = window.location.origin + getLink({});

	return (
		<div>
			<p className="weight mx-4 mt-3 mb-2 text-sm font-normal text-default">Share the config with others.</p>
			<UrlCopy url={fullURL} />
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
}
