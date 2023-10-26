// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { AppWindow, Cloud, Github } from "lucide-react";
import { Button } from "../button";
import BackendValidation from "./BackendValidation";
import type { ICurrentValidation } from "./ValidationType";

export default function ValidationTypeContent({
	current,
	setCurrent,
}: {
	current: ICurrentValidation;
	setCurrent: (current: ICurrentValidation) => void;
}) {
	return (
		<div className="bg-neutral-150 flex flex-col divide-solid divide-y rounded-md">
			<ContentRow
				isCurrent={current.provider === "Browser-only"}
				title="Browser-only validation"
				description="Limited syntax checks run in your browser. It may not recognize receivers, exporters or other components."
				icon={<AppWindow height={16} color="#9CA2AB" />}
			>
				{current.provider !== "Browser-only" && (
					<Button
						onClick={() => setCurrent({ provider: "Browser-only", version: "", distro: "" })}
						size={"xs"}
						className="w-max"
						variant={"default"}
					>
						Validate in browser
					</Button>
				)}
			</ContentRow>
			<ContentRow
				backend
				title="Distribution-specific validation"
				description="Comprehensive validation performed in a backend against actual distribution binaries. The configuration sent to the backend are not stored and are used exclusively for the validation "
				icon={<Cloud height={16} color="#9CA2AB" />}
			>
				<BackendValidation current={current} setCurrent={setCurrent} />
			</ContentRow>
		</div>
	);
}

export function ContentRow({
	title,
	description,
	icon,
	children,
	backend,
	isCurrent,
}: {
	title: string;
	description: string;
	icon: React.ReactNode;
	children: React.ReactNode;
	backend?: boolean;
	isCurrent?: boolean;
}) {
	return (
		<div className="flex flex-col gap-y-4 pt-3 pb-5 px-3 ">
			<div className="flex items-center gap-x-2 px-2">
				<div className="w-min">{icon}</div>
				<div className="flex items-center gap-x-3">
					<p className="text-[13px] font-semibold text-neutral-950">{title}</p>
					{isCurrent && <CurrentBadge />}
				</div>
			</div>
			<div className="flex flex-col gap-y-4 px-10">
				<p className="text-[13px] font-normal text-neutral-600">
					{description}
					{backend && (
						<a href="https://github.com/dash0hq/otelbin" className="text-neutral-600" target="_blank">
							{"( "}
							<span className="text-[11px] font-normal text-neutral-950">
								{"see code"}
								<Github height={12} className="inline-block" />
							</span>
							{")."}
						</a>
					)}
				</p>
				{children}
			</div>
		</div>
	);
}

export function CurrentBadge() {
	return (
		<div className="bg-neutral-700 text-xs text-neutral-100 font-medium rounded-[10px] px-1 flex justify-center items-center">
			current
		</div>
	);
}
