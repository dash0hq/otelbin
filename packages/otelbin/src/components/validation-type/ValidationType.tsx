// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { Button } from "../button";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import Down from "./../assets/svg/down.svg";
import ValidationTypeContent from "./ValidationTypeContent";
import { useDistributions } from "../validation/useDistributions";
import { useUrlState } from "~/lib/urlState/client/useUrlState";
import { distroBinding, distroVersionBinding } from "../validation/binding";
import InfoBox from "./InfoBox";

export interface ICurrentDistro {
	distro: string;
	version: string;
	name: string;
}

export default function ValidationType() {
	const [{ distro, distroVersion }] = useUrlState([distroBinding, distroVersionBinding]);
	const [open, setOpen] = useState(false);

	const { data } = useDistributions();

	const currentDistro =
		data && distro && distroVersion
			? { distro: distro, version: distroVersion, name: data[distro]?.name || "" }
			: undefined;

	return (
		<div className="flex items-center gap-x-4">
			<Popover open={open} onOpenChange={setOpen} modal={true}>
				<PopoverTrigger asChild>
					<Button size="xs" variant="cta">
						Validation:{" "}
						<strong>{`${currentDistro?.name ?? "Browser-only"} ${currentDistro ? " – " : ""} ${
							currentDistro ? currentDistro.version : ""
						}`}</strong>{" "}
						<Down />
					</Button>
				</PopoverTrigger>
				<PopoverContent align="start" className="p-0 max-w-[480px] overflow-y-auto max-h-[90vh]">
					<ValidationTypeContent currentDistro={currentDistro} data={data} setOpen={setOpen} />
				</PopoverContent>
			</Popover>
			{distro === null && distroVersion === null && <InfoBox />}
		</div>
	);
}
