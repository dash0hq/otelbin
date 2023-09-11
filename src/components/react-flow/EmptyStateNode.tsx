// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { Button } from "@dash0hq/ui/src/components/ui/button";
import { Github, Slack } from "lucide-react";
import React, { memo } from "react";
import { type Node } from "reactflow";

const EmptyStateNode = () => {
	return (
		<div className="flex flex-col bg-transparent text-default max-w-[487px] items-center gap-y-2">
			<p className="text-[18px] font-medium">Something went wrong</p>
			<p className="text-[14px] font-normal text-center">
				You can get support from the exceptionally smart developers in our open community.
			</p>
			<div className="flex items-center justify-center gap-x-2 mt-4">
				<a
					href="https://join.slack.com/t/dash0-community/shared_invite/zt-21gxq6bya-VcO45Wr~nlxc37aLWqqrjA"
					target="_blank"
					rel="noreferrer noopener"
				>
					<Button className="text-[13px] font-medium text-default">
						<Slack width={16} />
						Discuss on Slack
					</Button>
				</a>
				<a href="https://github.com/dash0hq/otelbin" target="_blank" rel="noreferrer noopener">
					<Button className="text-[13px] font-medium text-default">
						<Github width={16} />
						Follow on GitHub
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
