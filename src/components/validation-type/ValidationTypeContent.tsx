// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { AppWindow, Cloud, Github } from "lucide-react";
import { Button } from "../button";
import BackendValidation from "./BackendValidation";

export default function ValidationTypeContent() {
	return (
		<div className="bg-neutral-150 flex flex-col divide-solid divide-y">
			<ContentRow
				title="Browser-only validation"
				description="Limited syntax checks run in your browser. It may not recognize receivers, exporters or other components."
				icon={<AppWindow height={16} color="#9CA2AB" />}
			>
				<Button size={"xs"} className="w-max" variant={"default"}>
					Validate in browser
				</Button>
			</ContentRow>
			<ContentRow
				backend
				title="Distribution-specific validation"
				description="Comprehensive validation performed in a backend against actual distribution binaries. The configuration sent to the backend are not stored and are used exclusively for the validation "
				icon={<Cloud height={16} color="#9CA2AB" />}
			>
				<BackendValidation />
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
}: {
	title: string;
	description: string;
	icon: React.ReactNode;
	children: React.ReactNode;
	backend?: boolean;
}) {
	return (
		<div className="flex flex-col gap-y-4 pt-3 pb-5 px-3 ">
			<div className="flex items-center gap-x-2 px-2">
				<div className="w-min">{icon}</div>
				<p className="text-[13px] font-semibold text-neutral-950">{title}</p>
			</div>
			<div className="flex flex-col gap-y-4 px-10">
				<p className="text-[13px] font-normal text-neutral-600">
					{description}
					{backend && (
						<a href="#" className="text-neutral-600">
							{"("}
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
