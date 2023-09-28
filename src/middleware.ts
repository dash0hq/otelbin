// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { authMiddleware } from "@clerk/nextjs";

export default authMiddleware({
	debug: true,
	apiRoutes: ["/s/new"],
});

export const config = {
	matcher: ["/s/new"],
};
