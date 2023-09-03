import Logo from "./assets/svg/otelbin-logo-full.svg";
import { ButtonGroup, ButtonGroupItem } from "@dash0/components/ui/button-group";
import { Columns, Code2, LogIn } from "lucide-react";
import { ServiceMapIcon } from "@dash0/icons";
import { Tooltip, TooltipContent, TooltipTrigger } from "@dash0/components/ui/tooltip";
import { Share } from "~/components/share/Share";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "@dash0/components/ui/button";

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
		Icon: ServiceMapIcon,
		tooltip: "Only show the pipeline visualization",
	},
];

export default function AppHeader({ activeView, setView }: { activeView: string; setView: (view: string) => void }) {
	return (
		<div className="flex shrink-0 items-center justify-between border-b-1 border-subtle bg-neutral-150 px-4 py-3">
			<a href="https://www.dash0.com?utm_source=otelbin&utm_medium=logo&utm_campaign=otelbin" target="_blank">
				<Logo height="26" />
			</a>
			<div className="flex gap-x-2">
				<ButtonGroup size="xs" variant="default" className="!gap-0 bg-button">
					{viewModes.map(({ type, Icon, tooltip }) => (
						<Tooltip key={type}>
							<TooltipTrigger asChild>
								<ButtonGroupItem
									onClick={() => setView(type)}
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
						afterSignOutUrl="/"
						appearance={{
							elements: {
								avatarBox: "w-6 h-6",
							},
						}}
					/>
				</SignedIn>
				<SignedOut>
					<SignInButton mode="modal">
						<Button size="xs">
							<LogIn />
						</Button>
					</SignInButton>
				</SignedOut>
			</div>
		</div>
	);
}

//
