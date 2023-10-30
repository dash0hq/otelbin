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

export interface ICurrentDistro {
	distro: string;
	version: string;
	provider: string;
}

export default function ValidationType() {
	const [{ distro, distroVersion }] = useUrlState([distroBinding, distroVersionBinding]);
	const [open, setOpen] = useState(false);

	const { data } = useDistributions();

	const currentDistro =
		data && distro && distroVersion
			? { distro: distro, version: distroVersion, provider: data[distro]?.provider || "" }
			: undefined;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button size="xs" variant="cta">
					Validation:{" "}
					<strong>{`${currentDistro?.provider ?? "Browser-only"} ${currentDistro ? " – " : ""} ${
						currentDistro ? currentDistro.version : ""
					}`}</strong>{" "}
					<Down />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" className="p-0 max-w-[480px]">
				<ValidationTypeContent currentDistro={currentDistro} data={data} setOpen={setOpen} />
			</PopoverContent>
		</Popover>
	);
}
