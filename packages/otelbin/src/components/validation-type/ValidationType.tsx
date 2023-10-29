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
	initialDistroItems: {
		provider: string;
		distro: string;
		version: string;
	}[];
}

export default function ValidationType() {
	const [{ distro, distroVersion }] = useUrlState([distroBinding, distroVersionBinding]);
	const [currentDistro, setCurrentDistro] = useState<ICurrentValidation>({
		title: {
			provider: "Browser-only",
			version: "",
			distro: "",
		},
		initialDistroItems: [],
	});

	const { data } = useDistributions();

	const initialDistroItems = useMemo(() => {
		if (data && distro && distroVersion) {
			return [
				{
					provider: data[distro]?.provider || "",
					distro: distro || "",
					version: distroVersion || "",
				},
			];
		} else if (data) {
			return Object.keys(data).map((key) => ({
				provider: data[key]?.provider || "",
				distro: key || "",
				version: (data && Array.isArray(data[key]?.releases) && data[key]?.releases[0]?.version) || "",
			}));
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
				initialDistroItems: initialDistroItems || [],
			});
		} else if (data) {
			setCurrentDistro({
				title: {
					provider: "Browser-only",
					version: "",
					distro: "",
				},
				initialDistroItems: initialDistroItems || [],
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data]);

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
