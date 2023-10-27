// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { Button } from "../button";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import Down from "./../assets/svg/down.svg";
import ValidationTypeContent from "./ValidationTypeContent";

export interface ICurrentValidation {
	title: {
		provider: string;
		version: string;
		distro: string;
	};
	initialDistroItems: {
		provider: string;
		distro: string;
		version: string;
	}[];
}

export default function ValidationType() {
	const [currentDistro, setCurrentDistro] = useState<ICurrentValidation>({
		title: {
			provider: "Browser-only",
			version: "",
			distro: "",
		},
		initialDistroItems: [],
	});

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button size="xs" variant="cta">
					Validation:{" "}
					<strong>{`${currentDistro.title.provider} ${currentDistro.title.provider !== "Browser-only" ? " – " : ""} ${
						currentDistro.title.version
					}`}</strong>{" "}
					<Down />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" className="p-0 max-w-[480px]">
				<ValidationTypeContent currentDistro={currentDistro} setCurrentDistro={setCurrentDistro} />
			</PopoverContent>
		</Popover>
	);
}
