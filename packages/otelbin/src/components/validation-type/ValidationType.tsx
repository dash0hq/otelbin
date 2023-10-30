// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { useEffect, useMemo, useState } from "react";
import { Button } from "../button";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import Down from "./../assets/svg/down.svg";
import ValidationTypeContent from "./ValidationTypeContent";
import { useDistributions } from "../validation/useDistributions";
import { useUrlState } from "~/lib/urlState/client/useUrlState";
import { distroBinding, distroVersionBinding } from "../validation/binding";

export interface ICurrentValidation {
	title: {
		provider: string;
		version: string;
		distro: string;
	};
	selected: {
		provider: string;
		distro: string;
		version: string;
	};
}

export default function ValidationType() {
	const [{ distro, distroVersion }] = useUrlState([distroBinding, distroVersionBinding]);
	const [currentDistro, setCurrentDistro] = useState<ICurrentValidation>({
		title: {
			provider: "Browser-only",
			version: "",
			distro: "",
		},
		selected: { provider: "", distro: "", version: "" },
	});

	const { data } = useDistributions();

	const initialDistroItems = useMemo(() => {
		if (data && distro && distroVersion) {
			return {
				provider: data[distro]?.provider || "",
				distro: distro || "",
				version: distroVersion || "",
			};
		}
	}, [data, distro, distroVersion]);

	useEffect(() => {
		if (data && distro && distroVersion) {
			setCurrentDistro({
				title: {
					provider: data[distro]?.provider || "Browser-only",
					version: distroVersion || "",
					distro: distro || "",
				},
				selected: initialDistroItems || { provider: "", distro: "", version: "" },
			});
		} else if (data) {
			setCurrentDistro({
				title: {
					provider: "Browser-only",
					version: "",
					distro: "",
				},
				selected: { provider: "", distro: "", version: "" },
			});
		}
	}, [data, distro, distroVersion, initialDistroItems]);

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
				<ValidationTypeContent currentDistro={currentDistro} setCurrentDistro={setCurrentDistro} data={data} />
			</PopoverContent>
		</Popover>
	);
}
