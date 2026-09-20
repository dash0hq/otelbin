// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

export interface AppCapabilities {
	auth: boolean;
	shortLinks: boolean;
}

type Environment = Record<string, string | undefined>;

function hasValue(value: string | undefined): boolean {
	return Boolean(value?.trim());
}

export function isClerkConfigured(env: Environment = process.env): boolean {
	return hasValue(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY) && hasValue(env.CLERK_SECRET_KEY);
}

export function isUpstashConfigured(env: Environment = process.env): boolean {
	return hasValue(env.UPSTASH_REDIS_REST_URL) && hasValue(env.UPSTASH_REDIS_REST_TOKEN);
}

export function getAppCapabilities(env: Environment = process.env): AppCapabilities {
	const auth = isClerkConfigured(env);
	return {
		auth,
		shortLinks: auth && isUpstashConfigured(env),
	};
}
