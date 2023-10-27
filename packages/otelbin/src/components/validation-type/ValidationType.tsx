// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { Button } from "../button";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import Down from "./../assets/svg/down.svg";
import ValidationTypeContent from "./ValidationTypeContent";

export interface ICurrentValidation {
	provider: string;
	version: string;
	distro: string;
}

export default function ValidationType() {
	const [current, setCurrent] = useState<ICurrentValidation>({
		provider: "Browser-only",
		version: "",
		distro: "",
	});

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button size="xs" variant="cta">
					Validation:{" "}
					<strong>{`${current.provider} ${current.provider !== "Browser-only" ? " – " : ""} ${
						current.version
					}`}</strong>{" "}
					<Down />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" className="p-0 max-w-[480px]">
				<ValidationTypeContent current={current} setCurrent={setCurrent} />
			</PopoverContent>
		</Popover>
	);
}
