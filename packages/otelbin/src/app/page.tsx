// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import ClientPage from "./ClientPage";
import { getAppCapabilities } from "~/lib/capabilities";

export default function Page() {
	return <ClientPage capabilities={getAppCapabilities()} />;
}
