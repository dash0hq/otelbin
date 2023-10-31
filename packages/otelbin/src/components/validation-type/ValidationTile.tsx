// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/accordion";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "~/components/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/tooltip";
import OtelLogo from "./../assets/svg/otel.svg";
import { Github, Globe } from "lucide-react";
import { Button } from "../button";
import { IconButton } from "../icon-button";
import { CurrentBadge } from "./ValidationTypeContent";
import type { Distribution } from "~/types";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUrlState } from "~/lib/urlState/client/useUrlState";
import { distroBinding, distroVersionBinding } from "../validation/binding";
import type { ICurrentDistro } from "./ValidationType";

export default function ValidationTile({
	id,
	setOpen,
	currentDistro,
	data,
}: {
	id: string;
	setOpen: (open: boolean) => void;
	currentDistro?: ICurrentDistro;
	data: Distribution;
}) {
	const isDistroActive = id === currentDistro?.provider;

	const [, getUrl] = useUrlState([distroBinding, distroVersionBinding]);
	const [version, setVersion] = useState<string>(
		isDistroActive ? currentDistro.version : data.releases[0]?.version ?? ""
	);
	const router = useRouter();

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
				return `${versions && versions[versions.length - 1]} - ${versions && versions[0]}`;
		}
	}

	return (
		<Accordion type="single" collapsible>
			<AccordionItem value="item-1" className="border-1 border-solid border-neutral-350 rounded-md">
				<AccordionTrigger className="hover:no-underline px-3 hover:bg-button-hover rounded-md">
					<div className="flex items-center gap-x-3 w-full">
						<OtelLogo />
						<div className="flex flex-col items-start">
							<div className="flex items-center gap-x-3">
								<p className="text-[13px] font-semibold text-neutral-950">{data?.provider}</p>
								{currentDistro?.distro === id && <CurrentBadge />}
							</div>
							<p className="text-xs font-normal text-neutral-600">{`${
								Array.isArray(data?.releases) && formatVersionsRange(data?.releases.map((release) => release.version))
							}`}</p>
						</div>
					</div>
				</AccordionTrigger>
				<AccordionContent>
					<div className="flex flex-col gap-y-3 py-3 px-3">
						<p className="text-[13px] text-neutral-600">{data?.description}</p>
						<div className="flex items-center gap-x-1">
							<a href={data?.website} target="_blank" className="text-neutral-950">
								<IconButton variant={"outline"} size={"xs"} className="w-full px-2 flex items-center gap-x-2">
									<Globe height={12} color="#9CA2AB" />
									{data?.website}
								</IconButton>
							</a>
							{data?.repository && (
								<Tooltip>
									<TooltipTrigger asChild>
										<a href={`https://github.com/${data?.repository}`} target="_blank">
											<IconButton variant={"outline"} size={"xs"}>
												<Github height={10} color="#9CA2AB" />
											</IconButton>
										</a>
									</TooltipTrigger>
									<TooltipContent>{`https://github.com/${data?.repository}`}</TooltipContent>
								</Tooltip>
							)}
						</div>
						<div className="flex items-center gap-x-2 border-t-1 border-solid border-neutral-250 pt-4">
							<Select
								defaultValue={currentDistro?.distro === id ? currentDistro.version || "" : data?.releases[0]?.version}
								onValueChange={(value) => {
									setVersion(value);
								}}
							>
								<SelectTrigger className="h-6 w-max bg-neutral-350">
									<SelectValue placeholder={Array.isArray(data?.releases) && data?.releases[0]?.version} />
								</SelectTrigger>
								<SelectContent>
									<SelectGroup>
										{Array.isArray(data?.releases) &&
											data?.releases
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
									router.push(
										getUrl({
											distro: id,
											distroVersion: version,
										})
									);
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
