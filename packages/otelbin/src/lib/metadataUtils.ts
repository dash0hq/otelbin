// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { parse } from "./urlState/jsurl2";
import JsYaml from "js-yaml";
import type { IConfig } from "~/components/react-flow/dataType";
import { type Node } from "reactflow";

export function parseUrlFragment(url: URL) {
	if (!url) {
		return {};
	}
	const urlHash = url.hash;
	let parsedConfig = "";
	if (urlHash != null) {
		try {
			if (!urlHash.includes("#config=")) {
				return {};
			}
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

export function calcScale(edgeWidth: number, nodes?: Node[]) {
	if (nodes?.length === 0 || !nodes) return "1";
	const targetHeight = 630;
	const targetWidth = 1200;
	const parentNodes = nodes?.filter((node) => node.type === "parentNodeType");
	const processors = nodes?.filter((node) => node.type === "processorsNode");
	const nodesHeight = parentNodes?.map((node) => node.data.height) ?? [0];
	const totalHeight = nodesHeight?.reduce((sum, height) => sum + (height + 50), 0) + 4 * 24;
	const totalHorizontalNodesCount = (processors?.length ?? 0) + 2;
	const totalWidth = totalHorizontalNodesCount * 140 + (totalHorizontalNodesCount - 1) * edgeWidth;
	const scale = Math.min(targetHeight / totalHeight, targetWidth / totalWidth).toFixed(3);
	return scale.toString();
}
