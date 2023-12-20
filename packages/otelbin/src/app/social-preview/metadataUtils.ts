// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import type { IConfig } from "~/components/react-flow/dataType";
import { type Node } from "reactflow";
import type { Binding } from "~/lib/urlState/binding";
import { parseUrlState } from "../../lib/urlState/parseUrlState";
import type { Bindings } from "~/lib/urlState/typeMapping";

export function sortAndDeduplicate(arr: string[]) {
	if (arr.length === 0) return "-";
	const sortedStrings = arr.toSorted((a, b) => a.localeCompare(b));
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

export function toUrlState<T extends Binding<unknown>[]>(url: URL, binds: T): Bindings<T> {
	if (!url.hash) {
		return {} as Bindings<T>;
	}
	let hash = url.hash;
	if (hash.startsWith("#")) {
		hash = hash.substring(1);
	}
	const hashSearchParams = new URLSearchParams(hash);

	return parseUrlState(hashSearchParams, binds);
}
