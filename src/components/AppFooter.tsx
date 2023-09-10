// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import Love from "~/components/assets/svg/love.svg";
import Dash0 from "~/components/assets/svg/dash0.svg";
import { Github, Slack } from "lucide-react";
import React from "react";

export function AppFooter() {
	return (
		<div className="flex shrink-0 items-center justify-between border-t-1 border-subtle bg-neutral-150 pr-4 pl-[22px] py-2 text-xs font-normal text-subtl">
			<div className="flex gap-4">
				<a
					className="flex cursor-pointer items-center gap-1 transition-colors hover:text-default"
					href="https://join.slack.com/t/dash0-community/shared_invite/zt-21gxq6bya-VcO45Wr~nlxc37aLWqqrjA"
					target="_blank"
					rel="noreferrer noopener"
				>
					<Slack size="0.875rem" />
					Community Slack
				</a>
				<a
					className="flex cursor-pointer items-center gap-1 transition-colors hover:text-default"
					href="https://github.com/dash0hq/otelbin"
					target="_blank"
					rel="noreferrer noopener"
				>
					<Github size="0.875rem" />
					GitHub
				</a>
			</div>
			<a
				href="https://www.dash0.com/?utm_source=otelbin&utm_medium=footer&utm_campaign=otelbin"
				target="_blank"
				className="flex cursor-pointer items-center whitespace-nowrap transition-colors hover:text-default"
			>
				Crafted with <Love className="mx-1" /> by
				<Dash0 fill="#6D737D" width="55px" className="ml-2" />
			</a>
		</div>
	);
}
