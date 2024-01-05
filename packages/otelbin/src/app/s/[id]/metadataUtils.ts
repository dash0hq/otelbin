// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import type { IConfig } from "~/components/react-flow/dataType";
import { type Node } from "reactflow";
import type { Binding } from "~/lib/urlState/binding";
import { parseUrlState } from "../../../lib/urlState/parseUrlState";
import type { Bindings } from "~/lib/urlState/typeMapping";

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

export function calcScale(parentNodes?: Node[]) {
	const targetHeight = 630;
	const targetWidth = 1200;

	if (parentNodes && parentNodes?.length > 0) {
		const nodesX = parentNodes?.map((node) => node.position.x);
		const nodesXMax = parentNodes?.map((node) => node.position.x + node.data.width);
		const minX = Math.min(...nodesX);
		const maxX = Math.max(...nodesXMax);
		const nodesY = parentNodes?.map((node) => node.position.y);
		const nodesYMax = parentNodes?.map((node) => node.position.y + node.data.height);
		const minY = Math.min(...nodesY);
		const maxY = Math.max(...nodesYMax);
		const totalHeight = maxY - minY ?? 1;
		const totalWidth = maxX - minX ?? 1;
		//For add some padding multiply it by 0.98
		const scale = Math.min(targetHeight / totalHeight, targetWidth / totalWidth) * 0.98;
		const totalXOffset = Math.max((targetWidth - totalWidth * scale) / 2 / scale, 0);
		const totalYOffset = -(targetHeight / 2) / scale + Math.max((targetHeight - totalHeight * scale) / 2 / scale, 0);
		return { scale: scale.toFixed(3).toString(), totalXOffset, totalYOffset };
	} else {
		return { scale: "1", totalXOffset: 0, totalYOffset: 0 };
	}
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
