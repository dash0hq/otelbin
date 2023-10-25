// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "~/components/accordion";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "~/components/select";
import { useDistributions } from "../validation/useDistributions";
import OtelLogo from "./../assets/svg/otel.svg";
import { Github, Globe } from "lucide-react";
import { Button } from "../button";

export default function BackendValidation() {
	const { data, isLoading } = useDistributions();

	function calcVersions(versions?: string[] | string) {
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
			{!isLoading ? (
				data &&
				Object.keys(data).map((key) => (
					<Accordion key={key} type="single" collapsible>
						<AccordionItem value="item-1" className="border-1 border-solid border-neutral-350 rounded-md px-3">
							<AccordionTrigger>
								<div className="flex items-center gap-x-3">
									<OtelLogo />
									<div className="flex flex-col items-start">
										<p className="text-[13px] font-semibold text-neutral-600">{data[key]?.provider}</p>
										<p className="text-xs font-normal text-neutral-600">{`${calcVersions(
											data[key]?.releases.map((release) => release.version)
										)}`}</p>
									</div>
								</div>
							</AccordionTrigger>
							<AccordionContent>
								<div className="flex flex-col gap-y-3 pb-3 px-3">
									<p className="text-[13px] text-neutral-600">{data[key]?.description}</p>
									<div className="flex items-center gap-x-1">
										<div className="rounded-md border-1 border-solid border-neutral-350 flex items-center w-max pr-1">
											<Globe height={12} color="#9CA2AB" />
											<a href={data[key]?.website} target="_blank" className="text-neutral-950">
												{data[key]?.website}
											</a>
										</div>
										{data[key]?.repository && (
											<a href={`https://github.com/${data[key]?.repository}`} target="_blank">
												<div className="rounded-md border-1 border-solid border-neutral-350 flex items-center w-max py-1 px-[2px]">
													<Github height={12} color="#9CA2AB" />
												</div>
											</a>
										)}
									</div>
									<div className="flex items-center gap-x-2 border-t-1 border-solid border-neutral-250 pt-4">
										<Select>
											<SelectTrigger className="h-6 w-max bg-neutral-350">
												<SelectValue placeholder={data[key]?.releases[0]?.version.toString()} />
											</SelectTrigger>
											<SelectContent>
												<SelectGroup>
													{data[key]?.releases
														.map((release) => release.version)
														.map((version) => (
															<SelectItem key={version} value={version}>
																{version}
															</SelectItem>
														))}
												</SelectGroup>
											</SelectContent>
										</Select>
										<Button size={"xs"} variant={"cta"}>
											Validate against this version
										</Button>
									</div>
								</div>
							</AccordionContent>
						</AccordionItem>
					</Accordion>
				))
			) : (
				<p>Loading...</p>
			)}
			<p className="text-[13px] text-neutral-600 font-normal">
				Missing your Distro?{" "}
				<span className="text-neutral-950">
					<a href="#">Let us know! </a>
				</span>
			</p>
		</>
	);
}
