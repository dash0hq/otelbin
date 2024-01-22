// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { useState } from "react";
import { Button } from "../button";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";
import Down from "./../assets/svg/down.svg";
import ValidationTypeContent from "./ValidationTypeContent";
import { useDistributions } from "../validation/useDistributions";
import { useUrlState } from "~/lib/urlState/client/useUrlState";
import { distroBinding, distroVersionBinding, envVarBinding } from "../validation/binding";
import InfoBox from "./InfoBox";
import { editorBinding } from "../monaco-editor/editorBinding";
import WarningBox from "./WarningBox";
import { useEnvVariables } from "~/contexts/EditorContext";

export interface ICurrentDistributionVersion {
	distro: string;
	version: string;
	name: string;
}

export default function ValidationType() {
	const [{ distro, distroVersion }] = useUrlState([distroBinding, distroVersionBinding, envVarBinding, editorBinding]);
	const [open, setOpen] = useState(false);
	const { data: distributions } = useDistributions();

	const currentDistributionVersion =
		distributions && distro && distroVersion
			? { distro: distro, version: distroVersion, name: distributions[distro]?.name || "" }
			: undefined;

	const { envVarState } = useEnvVariables();
	const unboundVariables = Object.values(envVarState).filter(
		(envVar) => envVar.submittedValue === undefined && envVar.defaultValues?.length === 0
	);

	return (
		<div className="flex items-center gap-x-4">
			<Popover open={open} onOpenChange={setOpen} modal={true}>
				<PopoverTrigger asChild>
					<Button size="xs" variant="cta">
						Validation:{" "}
						<strong>{`${currentDistributionVersion?.name ?? "Browser-only"} ${
							currentDistributionVersion ? " – " : ""
						} ${currentDistributionVersion ? currentDistributionVersion.version : ""}`}</strong>{" "}
						<Down />
					</Button>
				</PopoverTrigger>
				<PopoverContent align="start" className="p-0 max-w-[480px] overflow-y-auto max-h-[90vh]">
					<ValidationTypeContent
						currentDistributionVersion={currentDistributionVersion}
						distributions={distributions}
						setOpen={setOpen}
					/>
				</PopoverContent>
			</Popover>
			{distro === null && distroVersion === null && <InfoBox />}
			{distro !== null && distroVersion !== null && unboundVariables.length > 0 && (
				<WarningBox unboundVariables={unboundVariables.length} />
			)}
		</div>
	);
}
