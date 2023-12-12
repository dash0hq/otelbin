// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { parse } from "./urlState/jsurl2";
import JsYaml from "js-yaml";
import type { IConfig } from "~/components/react-flow/dataType";

export function parseUrl(url: URL) {
	const urlHash = url.hash;
	let parsedConfig = "";
	if (urlHash != null) {
		try {
			const config = urlHash.split("=")[1] ?? "";
			const decodedConfig = decodeURIComponent(config);
			parsedConfig = parse(decodedConfig);
		} catch (e) {
			console.warn("Failed to parse config fragment #config.", urlHash, e);
		}
	}
	const jsonData = JsYaml.load(parsedConfig) as IConfig;
	return jsonData;
}

export function sortAndDeduplicate(arr: string[]) {
	if (arr.length === 0) return "-";
	const sortedStrings = arr.sort((a, b) => a.localeCompare(b));
	const modifiedStrings = sortedStrings.map((str) => str.split("/")[0]);
	const uniqueStrings = [...new Set(modifiedStrings)];
	const joinedStrings = uniqueStrings.join(", ");
	return joinedStrings;
}

export function extractComponents(jsonData: IConfig) {
	const components: string[] = [];
	if (Object.keys(jsonData).length === 0) {
		return ["-"];
	}
	Object.keys(jsonData).forEach((key) => {
		if (key !== "service") {
			const value = jsonData[key];
			const component = Object.keys(value as string[]);
			components.push(...component);
		}
	});
	return components;
}
