// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import type { StaticImageData } from "next/image";
import ErrorImg from "~/components/assets/png/errors.png";
import BackendValidationImg from "~/components/assets/png/backend-validation.png";
import ShareImg from "~/components/assets/png/share.png";
import VisualizationImg from "~/components/assets/png/visualization.png";

interface WelcomeModal {
	title: string;
	description: string;
	image: StaticImageData;
}

export const welcomeModalData: WelcomeModal[] = [
	{
		title: "Welcome to OTelBin",
		description:
			"OTelBin is a free editing, visualization and validation tool for OpenTelemetry collector configurations.",
		image: VisualizationImg,
	},
	{
		title: "Code editor with syntax highlighting & code completion",
		description: "Craft your configuration seamlessly in the editor with real-time syntax and schema validation.",
		image: ErrorImg,
	},
	{
		title: "Validate against your distribution",
		description: "Go beyond schema checks through validation in a backend against actual distribution binaries.",
		image: BackendValidationImg,
	},
	{
		title: "Collaborate with others",
		description:
			"The OpenTelemetry collector configuration is persisted within the URL so that you can always share what you are working on. Link your configuration in OTelBin to ask or offer help, with support for pipeline previews in Slack and other messaging platforms. In need of a short URL? OTelBin has a built-in URL shortener.",
		image: ShareImg,
	},
];
