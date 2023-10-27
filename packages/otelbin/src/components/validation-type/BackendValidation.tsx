// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/accordion";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "~/components/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "~/components/tooltip";
import { useDistributions } from "../validation/useDistributions";
import OtelLogo from "./../assets/svg/otel.svg";
import { Github, Globe } from "lucide-react";
import { Button } from "../button";
import { preload } from "swr";
import { IconButton } from "../icon-button";
import { CurrentBadge } from "./ValidationTypeContent";
import type { ICurrentValidation } from "./ValidationType";
import { useEffect, useMemo } from "react";
import { useUrlState } from "~/lib/urlState/client/useUrlState";
import { useRouter } from "next/navigation";
import { distroBinding, distroVersionBinding } from "../validation/binding";

const fetcher = (url: string) => fetch(url).then((res) => res.json());

preload(`https://www.otelbin.io/validation/supported-distributions`, fetcher);

export default function BackendValidation({
	currentDistro,
	setCurrentDistro,
}: {
	currentDistro: ICurrentValidation;
	setCurrentDistro: (current: ICurrentValidation) => void;
}) {
	const { data } = useDistributions();
	const [{}, getUrl] = useUrlState([distroBinding, distroVersionBinding]);

	const router = useRouter();

	const initialDistroItems = useMemo(
		() =>
			data
				? Object.keys(data).map((key) => ({
						provider: data[key]?.provider || "",
						distro: key || "",
						version: (data && Array.isArray(data[key]?.releases) && data[key]?.releases[0]?.version) || "",
				  }))
				: [],
		[data]
	);

	useEffect(() => {
		setCurrentDistro({
			...currentDistro,
			initialDistroItems: initialDistroItems,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data]);

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
		<>
			{data ? (
				Object.keys(data).map((key) => (
					<Accordion key={key} type="single" collapsible>
						<AccordionItem value="item-1" className="border-1 border-solid border-neutral-350 rounded-md">
							<AccordionTrigger className="hover:no-underline px-3 hover:bg-button-hover rounded-md">
								<div className="flex items-center gap-x-3 w-full">
									<OtelLogo />
									<div className="flex flex-col items-start">
										<div className="flex items-center gap-x-3">
											<p className="text-[13px] font-semibold text-neutral-950">{data[key]?.provider}</p>
											{currentDistro.title.provider === data[key]?.provider && <CurrentBadge />}
										</div>
										<p className="text-xs font-normal text-neutral-600">{`${
											Array.isArray(data[key]?.releases) &&
											formatVersionsRange(data[key]?.releases.map((release) => release.version))
										}`}</p>
									</div>
								</div>
							</AccordionTrigger>
							<AccordionContent>
								<div className="flex flex-col gap-y-3 py-3 px-3">
									<p className="text-[13px] text-neutral-600">{data[key]?.description}</p>
									<div className="flex items-center gap-x-1">
										<a href={data[key]?.website} target="_blank" className="text-neutral-950">
											<IconButton variant={"outline"} size={"xs"} className="w-full px-2 flex items-center gap-x-2">
												<Globe height={12} color="#9CA2AB" />
												{data[key]?.website}
											</IconButton>
										</a>
										{data[key]?.repository && (
											<Tooltip>
												<TooltipTrigger asChild>
													<a href={`https://github.com/${data[key]?.repository}`} target="_blank">
														<IconButton variant={"outline"} size={"xs"}>
															<Github height={10} color="#9CA2AB" />
														</IconButton>
													</a>
												</TooltipTrigger>
												<TooltipContent>{`https://github.com/${data[key]?.repository}`}</TooltipContent>
											</Tooltip>
										)}
									</div>
									<div className="flex items-center gap-x-2 border-t-1 border-solid border-neutral-250 pt-4">
										<Select
											defaultValue={data[key]?.releases[0]?.version.toString()}
											onValueChange={(value) => {
												setCurrentDistro({
													...currentDistro,
													initialDistroItems: currentDistro.initialDistroItems?.map((distro) => {
														if (distro.provider === data[key]?.provider) {
															return {
																...distro,
																version: value,
															};
														}
														return distro;
													}),
												});
												console.log(currentDistro);
											}}
										>
											<SelectTrigger className="h-6 w-max bg-neutral-350">
												<SelectValue
													placeholder={Array.isArray(data[key]?.releases) && data[key]?.releases[0]?.version.toString()}
												/>
											</SelectTrigger>
											<SelectContent>
												<SelectGroup>
													{Array.isArray(data[key]?.releases) &&
														data[key]?.releases
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
												const distro = key;
												const defaultVersion = data[key]?.releases[0]?.version.toString() || "";
												const currentVersion =
													currentDistro.initialDistroItems?.find((distro) => distro.distro === key)?.version || "";
												const version = currentVersion || defaultVersion;
												setCurrentDistro({
													...currentDistro,
													title: { provider: data[key]?.provider || "", version: version, distro: key },
												});
												const newUrl = getUrl({
													distro: distro,
													distroVersion: version,
												});
												router.push(newUrl);
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
				))
			) : (
				<p>No Data is available</p>
			)}
			<p className="text-[13px] text-neutral-600 font-normal">
				Missing your Distro?{" "}
				<span className="text-neutral-950">
					<a href="https://github.com/dash0hq/otelbin/issues/new" target="_blank">
						Let us know!{" "}
					</a>
				</span>
			</p>
		</>
	);
}
