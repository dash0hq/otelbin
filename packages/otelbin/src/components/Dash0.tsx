// SPDX-FileCopyrightText: 2025 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

"use client";

import { init } from "@dash0hq/sdk-web";
import { useEffect } from "react";

export function Dash0() {
	useEffect(() => {
		if (
			process.env.NEXT_PUBLIC_DASH0_SERVICE_NAME &&
			process.env.NEXT_PUBLIC_DASH0_URL &&
			process.env.NEXT_PUBLIC_DASH0_AUTH_TOKEN
		) {
			init({
				serviceName: process.env.NEXT_PUBLIC_DASH0_SERVICE_NAME,
				serviceVersion: process.env.VERCEL_GIT_COMMIT_SHA,
				environment: process.env.VERCEL_ENV,
				endpoint: [
					{
						url: process.env.NEXT_PUBLIC_DASH0_URL,
						authToken: process.env.NEXT_PUBLIC_DASH0_AUTH_TOKEN,
					},
				],
			});
		}
	}, []);

	return <></>;
}
