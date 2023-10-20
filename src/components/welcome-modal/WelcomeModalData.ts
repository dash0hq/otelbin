// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import type { StaticImageData } from "next/image";
import WelcomeModal1 from "~/components/assets/png/welcome-modal-slide-1.png";
import WelcomeModal2 from "~/components/assets/png/welcome-modal-slide-2.png";
import WelcomeModal3 from "~/components/assets/png/welcome-modal-slide-3.png";
import WelcomeModal4 from "~/components/assets/png/welcome-modal-slide-4.png";

interface WelcomeModal {
	title: string;
	description: string;
	image: StaticImageData;
}

export const welcomeModalData: WelcomeModal[] = [
	{
		title: "Welcome to OTelBin!",
		description: "A simple tool to visualize your OpenTelemetry collector configurations",
		image: WelcomeModal1,
	},
	{
		title: "Visualize your configs.",
		description: "Visualize your collector configuration to understand its pipelines",
		image: WelcomeModal4,
	},
	{
		title: "Write your config in the editor with live syntax validation.",
		description: "Craft your configuration seamlessly in the editor with real-time syntax and schema validation!",
		image: WelcomeModal2,
	},
	{
		title: "Easily find your config errors.",
		description: "Effortlessly pinpoint and rectify configuration errors with simplicity.",
		image: WelcomeModal3,
	},
];
