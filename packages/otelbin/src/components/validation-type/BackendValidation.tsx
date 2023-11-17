// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import type { ICurrentDistributionVersion } from "./ValidationType";
import type { Distributions } from "~/types";
import ValidationTile from "./ValidationTile";

export default function BackendValidation({
	setOpen,
	currentDistributionVersion,
	distributions,
}: {
	setOpen: (open: boolean) => void;
	currentDistributionVersion?: ICurrentDistributionVersion;
	distributions?: Distributions;
}) {
	return (
		<>
			{distributions ? (
				Object.entries(distributions).map(([distributionId, distribution]) => (
					<ValidationTile distribution={distribution} distributionId={distributionId} key={distributionId} setOpen={setOpen} currentDistributionVersion={currentDistributionVersion} />
				))
			) : (
				<p>No Data is available</p>
			)}
			<p className="text-[13px] text-neutral-600 font-normal">
				Missing your Distro?{" "}
				<span className="text-neutral-950">
					<a href="https://github.com/dash0hq/otelbin/issues/new" target="_blank">
						Let us know!{" "}
					</a>
				</span>
			</p>
		</>
	);
}
