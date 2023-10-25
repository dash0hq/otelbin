// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { Button } from "../button";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import Down from "./../assets/svg/down.svg";
import BackendValidationContent from "./ValidationTypeContent";

export default function ValidationType() {
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button size="xs" variant="cta">
					Validation: <strong>OTel Collector Contrib – v0.87.0</strong> <Down />
				</Button>
			</PopoverTrigger>
			<PopoverContent align="start" className="p-0 max-w-[480px]">
				<BackendValidationContent />
			</PopoverContent>
		</Popover>
	);
}
