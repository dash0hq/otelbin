// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { Button } from "@dash0hq/ui/src/components/ui/button";
import { Github, Slack } from "lucide-react";
import React, { memo } from "react";
import { type Node } from "reactflow";

const EmptyStateNode = () => {
	return (
		<div className="flex flex-col bg-default border-subtle border-1 text-default max-w-[487px] items-center gap-y-2 py-3 px-3 rounded-md">
			<p className="text-[18px] font-medium">Syntax Errors in Configuration</p>
			<p className="text-[14px] font-normal text-center">
				Try fixing the YAML syntax errors, or get help through{" "}
				<code className="whitespace-nowrap bg-neutral-150 px-1 py-0.5 rounded-sm">#otel-collector</code> on the CNCF
				Slack.
			</p>
			<div className="flex items-center justify-center gap-2 mt-1 flex-wrap">
				<a href="https://slack.cncf.io/" target="_blank" rel="noreferrer noopener">
					<Button className="text-[13px] font-medium text-default" size="sm">
						<Slack width={16} />
						Join the CNCF Slack
					</Button>
				</a>
				<a href="https://slack.cncf.io/" target="_blank" rel="noreferrer noopener">
					<Button className="text-[13px] font-medium text-default" size="sm">
						<Slack width={16} />
						Join the Dash0 Slack
					</Button>
				</a>
				<a href="https://github.com/dash0hq/otelbin/issues/new" target="_blank" rel="noreferrer noopener">
					<Button className="text-[13px] font-medium text-default" size="sm">
						<Github width={16} />
						Report an OTelBin issue
					</Button>
				</a>
			</div>
		</div>
	);
};

export default memo(EmptyStateNode);

export const EmptyStateNodeData: Node[] = [
	{ id: "empty-node", type: "emptyState", position: { x: 0, y: 0 }, data: { value: "" } },
];
