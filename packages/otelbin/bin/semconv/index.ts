// SPDX-FileCopyrightText: 2024 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { writeFile } from "fs/promises";
import { parseModelDefinitions } from "./parser";

main().catch((err) => {
	console.error("Unexpected error in main()", err);
	process.exit(1);
});

async function main() {
	const attributes = await parseModelDefinitions("../../../semantic-conventions/");
	await writeFile("./src/app/semconv/attributes.json", JSON.stringify(attributes, undefined, 2));
}
