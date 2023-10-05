// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

"use client";

import { type PropsWithChildren, useEffect } from "react";

import { PostHogProvider as InternalPostHogProvider } from "posthog-js/react";
import posthog from "posthog-js";

export function PostHogProvider({ children }: PropsWithChildren) {
	useEffect(() => {
		if (typeof window !== "undefined" && process.env.NEXT_PUBLIC_POSTHOG_KEY) {
			posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY, {
				api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
				// Enable debug mode in development
				loaded: (posthog) => {
					if (process.env.NODE_ENV === "development") posthog.debug();
				},
			});
		}
	}, []);

	return <InternalPostHogProvider client={posthog}>{children}</InternalPostHogProvider>;
}
