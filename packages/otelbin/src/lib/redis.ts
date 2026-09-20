// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { Redis } from "@upstash/redis";
import { isUpstashConfigured } from "~/lib/capabilities";

export function createRedisIfConfigured(): Redis | undefined {
	return isUpstashConfigured() ? Redis.fromEnv() : undefined;
}
