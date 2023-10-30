// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import type { ICurrentDistro } from "./ValidationType";
import type { Distributions } from "~/types";
import ValidationTile from "./ValidationTile";

export default function BackendValidation({
	setOpen,
	currentDistro,
	data,
}: {
	setOpen: (open: boolean) => void;
	currentDistro?: ICurrentDistro;
	data?: Distributions;
}) {
	return (
		<>
			{data ? (
				Object.keys(data).map((key) => (
					<ValidationTile data={data[key]} id={key} key={key} setOpen={setOpen} currentDistro={currentDistro} />
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
