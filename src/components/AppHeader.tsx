// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import Logo from "./assets/svg/otelbin-logo-new.svg";
import { ButtonGroup, ButtonGroupItem } from "~/components/button-group";
import { Columns, Code2, LogIn } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/tooltip";
import { Share } from "~/components/share/Share";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "~/components/button";
import { useViewMode } from "~/contexts/EditorContext";
import { MapIcon } from "~/icons/map";

const viewModes = [
	{
		type: "both",
		Icon: Columns,
		tooltip: "Show editor and pipeline visualization",
	},
	{
		type: "code",
		Icon: Code2,
		tooltip: "Only show the editor",
	},
	{
		type: "pipeline",
		Icon: MapIcon,
		tooltip: "Only show the pipeline visualization",
	},
];

export default function AppHeader({ activeView }: { activeView: string }) {
	const { setViewMode } = useViewMode();

	return (
		<div className="flex shrink-0 items-center justify-between border-b-1 border-subtle bg-neutral-150 px-4 py-3">
			<div className="flex items-center gap-x-2">
				<Logo height={26} />
				<p className="text-sm font-semibold">OTelBin</p>
			</div>
			<div className="flex gap-x-2">
				<ButtonGroup size="xs" variant="default" className="!gap-0 bg-button">
					{viewModes.map(({ type, Icon, tooltip }) => (
						<Tooltip key={type}>
							<TooltipTrigger asChild>
								<ButtonGroupItem
									onClick={() => setViewMode(type)}
									className={`${activeView === type ? "!rounded-[6px] bg-primary" : ""}`}
								>
									<Icon className={activeView === type ? "!text-button-icon-active" : ""} />
								</ButtonGroupItem>
							</TooltipTrigger>
							<TooltipContent>{tooltip}</TooltipContent>
						</Tooltip>
					))}
				</ButtonGroup>

				<Share />

				<SignedIn>
					<UserButton
						afterSignOutUrl="/restore"
						appearance={{
							elements: {
								avatarBox: "w-6 h-6",
							},
						}}
					/>
				</SignedIn>
				<SignedOut>
					<SignInButton mode="modal" afterSignInUrl="/restore">
						<Button size="xs">
							<LogIn />
						</Button>
					</SignInButton>
				</SignedOut>
			</div>
		</div>
	);
}
