// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { Parser } from "yaml";
import JsYaml from "js-yaml";
export interface SourceToken {
	type:
		| "byte-order-mark"
		| "doc-mode"
		| "doc-start"
		| "space"
		| "comment"
		| "newline"
		| "directive-line"
		| "anchor"
		| "tag"
		| "seq-item-ind"
		| "explicit-key-ind"
		| "map-value-ind"
		| "flow-map-start"
		| "flow-map-end"
		| "flow-seq-start"
		| "flow-seq-end"
		| "flow-error-end"
		| "comma"
		| "block-scalar-header";
	offset: number;
	indent: number;
	source: string;
}

export interface IKey {
	type: string;
	offset: number;
	indent: number;
	source: string;
}

export interface IItem {
	key: IKey;
	sep: IKey[];
	start: [];
	value: IValue;
}

export interface IValue {
	indent: number;
	items: IItem[];
	offset: number;
	type: string;
	source?: string;
	end?: IKey[];
}

export interface Document {
	type: "document";
	offset: number;
	start: SourceToken[];
	value?: IValue;
	end?: SourceToken[];
}

export interface IYamlElement {
	key: string;
	offset: number;
	value?: IYamlElement | IYamlElement[] | string;
}

export interface ILeaf {
	source?: string;
	offset: number;
	level1Parent?: string;
}

export interface IValidateItem {
	[key: string]: ILeaf[];
}

export interface IK8sObject {
	kind?: string;
	data?: {
		relay?: string;
	};
}

export const getYamlDocument = (editorValue: string) => {
	const value = editorValue;
	const parsedYaml = Array.from(new Parser().parse(value));
	const doc = parsedYaml.find((token) => token.type === "document") as Document;
	const docElements: IItem[] = doc?.value?.items ?? [];
	return docElements;
};

export function parseYaml(yamlItems: IItem[]) {
	const parsedYamlConfig: IYamlElement[] = [];
	if (!yamlItems) return;
	else if (Array.isArray(yamlItems)) {
		for (const item of yamlItems) {
			if (item) {
				const key = item.key?.source ?? item.value?.source;
				const keyOffset = item.key?.offset ?? item.value?.offset;
				const value = parseYaml(item.value?.items) ?? item.value?.source;
				parsedYamlConfig.push({ key: key, offset: keyOffset, value: value });
			}
		}
	}
	return parsedYamlConfig;
}

export function extractMainItemsData(docElements: IItem[]) {
	const mainItemsData: IValidateItem = {};

	const mainKeys = docElements
		.filter((item: IItem) => item.key?.source !== "service")
		.map((item: IItem) => item.key?.source);

	mainKeys.forEach((key: string) => {
		mainItemsData[key] =
			docElements
				.filter((item: IItem) => item.key?.source === key)[0]
				?.value?.items?.map((item: IItem) => {
					return { source: item.key?.source, offset: item.key?.offset };
				}) ?? [];
	});
	return mainItemsData;
}

export function extractServiceItems(docElements: IItem[]) {
	const serviceItems =
		(Array.isArray(docElements) &&
			docElements.length > 0 &&
			docElements.filter((item: IItem) => item.key?.source === "service")[0]?.value?.items) ||
		[];
	return serviceItems;
}

export function findLeafs(yamlItems?: IItem[], parent?: IItem, serviceItemsData?: IValidateItem) {
	if (yamlItems?.length === 0 || yamlItems === undefined) return {};
	else if (Array.isArray(yamlItems) && yamlItems.length > 0) {
		for (const item of yamlItems) {
			if (item?.value) {
				if (item.value.source && parent) {
					const source = item.value.source;
					const offset = item.value.offset;
					const parentKey = parent.key?.source;

					if (!serviceItemsData) return;
					if (!serviceItemsData[parentKey]) {
						serviceItemsData[parentKey] = [];
					}
					if (!serviceItemsData[parentKey]?.some((item: ILeaf) => item.source === source)) {
						serviceItemsData[parentKey]?.push({ source, offset });
					}
				} else if (Array.isArray(item.value.items)) {
					if (item.key) {
						findLeafs(item.value.items, item, serviceItemsData);
					}
				}
			}
		}
	}
	return serviceItemsData;
}

export function findPipelinesKeyValues(
	yamlItems?: IItem[],
	parent?: IItem,
	level1Parent?: IItem,
	serviceItemsData?: IValidateItem
) {
	if (yamlItems?.length === 0 || yamlItems === undefined) return {};
	else if (Array.isArray(yamlItems) && yamlItems.length > 0) {
		for (const item of yamlItems) {
			if (item?.value) {
				if (item.value.source && parent) {
					const source = item.value.source;
					const offset = item.value.offset;
					const parentKey = parent.key?.source;
					const level1ParentKey = level1Parent?.key?.source;
					if (!serviceItemsData) return;
					if (!serviceItemsData[parentKey]) {
						serviceItemsData[parentKey] = [];
					}
					if (serviceItemsData[parentKey]) {
						serviceItemsData[parentKey]?.push({ source, offset, level1Parent: level1ParentKey });
					}
				} else if (Array.isArray(item.value.items)) {
					if (item.key) {
						findPipelinesKeyValues(item.value.items, item, parent, serviceItemsData);
					}
				}
			}
		}
	}
	return serviceItemsData;
}

export function findLineAndColumn(config: string, targetOffset?: number) {
	const lines = config.length > 0 ? config.split("\n") : [];

	let currentOffset = 0;
	let lineIndex = 0;
	let column = 0;

	if (lines.length === 0 || (targetOffset && targetOffset < 0 && config.length)) {
		return { line: 0, column: 0 };
	}

	for (let i = 0; i < lines.length; i++) {
		const line = lines[i];
		const lineLength = line?.length ?? 0;

		if (currentOffset + lineLength >= (targetOffset || 0)) {
			lineIndex = i + 1;
			column = (targetOffset ?? 0) - currentOffset + 1;
			break;
		}

		currentOffset += lineLength + 1;
	}

	return { line: lineIndex, column };
}

export function isK8sConfigMap(config: string) {
	const jsonData = JsYaml.load(config) as IK8sObject;
	const isConfigMap = jsonData?.kind?.toLocaleLowerCase() === "configmap";
	return jsonData && jsonData?.data?.relay && isConfigMap ? true : false;
}

export function extractRelayFromK8sConfigMap(config: string): string | undefined {
	const jsonData = JsYaml.load(config) as IK8sObject;
	return isK8sConfigMap(config) ? jsonData?.data?.relay : config;
}
