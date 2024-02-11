// SPDX-FileCopyrightText: 2024 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { load } from "js-yaml";
import { glob } from "glob";
import { type Attribute, type AttributeContext } from "./otelbinSchema";
import { readFile } from "fs/promises";
import {
	attributeGroupsSchema,
	type EnumType,
	type ExamplePrimitive,
	isAttribute,
	isAttributeGroup,
	type PrimitiveAttributeType,
	type SchemaItem,
} from "./semanticConventionsSchema";
import { join } from "path";

export async function parseModelDefinitions(semanticConventionsDir: string): Promise<Attribute[]> {
	const files = await glob("model/**/*.yaml", { cwd: semanticConventionsDir });
	// Ensure consistent order in case we have to adapt the parsing logic. This makes debugging easier.
	files.sort((a, b) => a.localeCompare(b));

	const parsedAttributes = await Promise.all(
		files.map((file) => parseModelDefinitionFile(join(semanticConventionsDir, file)))
	);

	return parsedAttributes.flatMap((attributes) => attributes);
}

async function parseModelDefinitionFile(absoluteFilePath: string): Promise<Attribute[]> {
	const fileContent = await readFile(absoluteFilePath, {
		encoding: "utf-8",
	});

	const parsedFileContent = load(fileContent);
	try {
		const attributeGroups = attributeGroupsSchema.parse(parsedFileContent);
		return convertSchemaItems(attributeGroups.groups);
	} catch (e) {
		console.error(`Error parsing file: ${absoluteFilePath}`, JSON.stringify(e, undefined, 2));
		process.exit(1);
	}
}

function convertSchemaItems(
	schemaItems: SchemaItem[],
	context: AttributeContext = "resource",
	prefix = ""
): Attribute[] {
	return schemaItems.flatMap((schemaItem) => convertSchemaItem(schemaItem, context, prefix));
}

function convertSchemaItem(schemaItem: SchemaItem, context: AttributeContext = "resource", prefix = ""): Attribute[] {
	if (isAttributeGroup(schemaItem) && schemaItem.attributes != null) {
		const recurseContext = schemaItem.type !== "attribute_group" ? schemaItem.type : context;
		const recursePrefix = schemaItem.prefix != null ? `${prefix}${schemaItem.prefix}.` : prefix;
		return convertSchemaItems(schemaItem.attributes, recurseContext, recursePrefix);
	} else if (isAttribute(schemaItem)) {
		const examples: ExamplePrimitive[] = [];
		if (schemaItem.examples instanceof Array) {
			examples.push(...schemaItem.examples);
		} else if (schemaItem.examples != null) {
			examples.push(schemaItem.examples);
		}

		let type: PrimitiveAttributeType | "enum";
		let enumValues: EnumType | undefined;
		if (typeof schemaItem.type === "string") {
			type = schemaItem.type;
		} else {
			type = "enum";
			enumValues = schemaItem.type;
		}

		return [
			{
				key: `${prefix}${schemaItem.id}`,
				context,
				type,
				enum: enumValues,
				brief: schemaItem.brief,
				examples,
				note: schemaItem.note,
			},
		];
	}

	return [];
}
