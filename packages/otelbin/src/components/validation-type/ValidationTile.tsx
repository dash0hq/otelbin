// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/accordion";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "~/components/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/tooltip";
import AdotLogo from "./../assets/svg/distro-icons/adot.svg";
import OtelLogo from "./../assets/svg/distro-icons/otel.svg";
import SplunkLogo from "./../assets/svg/distro-icons/splunk.svg";
import { Github, Globe } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "../button";
import { IconButton } from "../icon-button";
import { CurrentBadge } from "./ValidationTypeContent";
import type { Distribution } from "~/types";
import { useState } from "react";
import { useUrlState } from "~/lib/urlState/client/useUrlState";
import { distroBinding, distroVersionBinding } from "../validation/binding";
import type { ICurrentDistributionVersion } from "./ValidationType";

export default function ValidationTile({
	distributionId,
	setOpen,
	currentDistributionVersion,
	distribution,
}: {
	distributionId: string;
	setOpen: (open: boolean) => void;
	currentDistributionVersion?: ICurrentDistributionVersion;
	distribution: Distribution;
}) {
	const isDistroActive = distributionId === currentDistributionVersion?.distro;
	const [, getLink] = useUrlState([distroBinding, distroVersionBinding]);
	const [version, setVersion] = useState<string>(
		isDistroActive ? currentDistributionVersion.version : distribution.releases[0]?.version ?? ""
	);

	function formatVersionsRange(versions?: string[] | string) {
		if (typeof versions === "string") {
			return versions;
		}
		switch (versions?.length) {
			case 0:
				return "";
			case 1:
				return versions[0];
			default:
				return `${versions && versions[versions.length - 1]} - ${versions?.[0]}`;
		}
	}

	let Icon: LucideIcon;
	switch (distribution?.icon) {
		case "adot":
			Icon = AdotLogo;
			break;
		case "splunk":
			Icon = SplunkLogo;
			break;
		default:
			Icon = OtelLogo;
			break;
	}

	return (
		<Accordion type="single" collapsible>
			<AccordionItem value="item-1" className="border-1 border-solid border-neutral-350 rounded-md">
				<AccordionTrigger className="hover:no-underline px-3 hover:bg-button-hover rounded-md">
					<div className="flex items-center gap-x-3 w-full">
						<Icon />
						<div className="flex flex-col items-start">
							<div className="flex items-center gap-x-3">
								<p className="text-[13px] font-semibold text-neutral-950">{distribution?.name}</p>
								{currentDistributionVersion?.distro === distributionId && <CurrentBadge />}
							</div>
							<p className="text-xs font-normal text-neutral-600">{`${
								Array.isArray(distribution?.releases) &&
								formatVersionsRange(distribution?.releases.map((release) => release.version))
							}`}</p>
						</div>
					</div>
				</AccordionTrigger>
				<AccordionContent>
					<div className="flex flex-col gap-y-3 py-3 px-3">
						<p className="text-[13px] text-neutral-600">{distribution?.description}</p>
						<div className="flex items-center gap-x-1">
							<a href={distribution?.website} target="_blank" className="text-neutral-950">
								<IconButton variant={"outline"} size={"xs"} className="w-full px-2 flex items-center gap-x-2">
									<Globe height={12} color="#9CA2AB" />
									{distribution?.website}
								</IconButton>
							</a>
							{distribution?.repository && (
								<Tooltip>
									<TooltipTrigger asChild>
										<a href={`https://github.com/${distribution?.repository}`} target="_blank">
											<IconButton variant={"outline"} size={"xs"}>
												<Github height={10} color="#9CA2AB" />
											</IconButton>
										</a>
									</TooltipTrigger>
									<TooltipContent>{`https://github.com/${distribution?.repository}`}</TooltipContent>
								</Tooltip>
							)}
						</div>
						<div className="flex items-center gap-x-2 border-t-1 border-solid border-neutral-250 pt-4">
							<Select
								defaultValue={
									currentDistributionVersion?.distro === distributionId
										? currentDistributionVersion.version || ""
										: distribution?.releases[0]?.version
								}
								onValueChange={(value) => {
									setVersion(value);
								}}
							>
								<SelectTrigger className="h-6 w-max bg-neutral-350">
									<SelectValue
										placeholder={Array.isArray(distribution?.releases) && distribution?.releases[0]?.version}
									/>
								</SelectTrigger>
								<SelectContent>
									<SelectGroup style={{ maxHeight: "50vh" }}>
										{Array.isArray(distribution?.releases) &&
											distribution?.releases
												.map((release) => release.version)
												.map((version) => (
													<SelectItem key={version} value={version}>
														{version}
													</SelectItem>
												))}
									</SelectGroup>
								</SelectContent>
							</Select>
							<Button
								onClick={() => {
									if (typeof window !== "undefined") {
										window.history.pushState(null, "", getLink({ distro: distributionId, distroVersion: version }));
									}
									setOpen(false);
								}}
								size={"xs"}
								variant={"cta"}
							>
								Validate against this version
							</Button>
						</div>
					</div>
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	);
}