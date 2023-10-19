// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import Down from "./assets/svg/down.svg";
import Logo from "./assets/svg/otelbin_logo_white.svg";
import { ButtonGroup, ButtonGroupItem } from "~/components/button-group";
import { Columns, Code2, LogIn, ChevronDown } from "lucide-react";
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
			<div className="flex items-center gap-x-4">
				<div className="flex items-center gap-x-2">
					<Logo height={22} />
					<p className="text-md font-bold text-neutral-950">OTelBin</p>
				</div>

				<div className="w-px bg-neutral-350 h-full">&nbsp;</div>

				<Button size="xs" variant="cta">
					Validation: <strong>OTel Collector Contrib – v0.87.0</strong> <Down />
				</Button>
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
