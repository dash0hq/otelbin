// SPDX-FileCopyrightText: 2024 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import z from "zod";

const spanKindSchema = z.enum(["client", "server"]);
export type SpanKind = z.infer<typeof spanKindSchema>;

const examplePrimitiveSchema = z.string().or(z.boolean()).or(z.number());
export type ExamplePrimitive = z.infer<typeof examplePrimitiveSchema>;
const exampleSchema = examplePrimitiveSchema.or(z.array(examplePrimitiveSchema));

const enumMemberSchema = z.object({
	id: z.string(),
	value: z.string().or(z.number()),
	brief: z.string().optional(),
});
export type EnumMember = z.infer<typeof enumMemberSchema>;

const enumTypeSchema = z.object({
	allow_custom_values: z.boolean().optional(),
	members: z.array(enumMemberSchema),
});
export type EnumType = z.infer<typeof enumTypeSchema>;

const attributeTypes = [
	"boolean",
	"double",
	"int",
	"string",
	"string[]",
	"template[string]",
	"template[string[]]",
] as const;
const primitiveAttributeTypeSchema = z.enum(attributeTypes);
export type PrimitiveAttributeType = z.infer<typeof primitiveAttributeTypeSchema>;
const attributeTypeSchema = z.enum(attributeTypes).or(enumTypeSchema);
export type AttributeType = z.infer<typeof attributeTypeSchema>;

const attributeSchema = z.object({
	id: z.string(),
	prefix: z.string().optional(),
	type: attributeTypeSchema,
	brief: z.string(),
	examples: exampleSchema.optional(),
	note: z.string().optional(),
});
export type Attribute = z.infer<typeof attributeSchema>;

const attributeRefSchema = z.object({
	ref: z.string(),
});
export type AttributeRef = z.infer<typeof attributeRefSchema>;

const metricSchema = z.object({
	type: z.literal("metric"),
	metric_name: z.string(),
});
export type Metric = z.infer<typeof metricSchema>;

const attributeGroupTypes = ["attribute_group", "event", "span", "resource"] as const;
const attributeGroupTypeSchema = z.enum(attributeGroupTypes);
export type AttributeGroupType = z.infer<typeof attributeGroupTypeSchema>;

const baseAttributeGroupSchema = z.object({
	id: z.string(),
	prefix: z.string().optional(),
	type: attributeGroupTypeSchema,
	span_kind: spanKindSchema.optional(),
});
export type AttributeGroup = z.infer<typeof baseAttributeGroupSchema> & {
	attributes?: (AttributeGroup | Attribute | AttributeRef | Metric)[];
};
export const attributeGroupSchema: z.ZodType<AttributeGroup> = baseAttributeGroupSchema.extend({
	attributes: z
		.lazy(() => attributeGroupSchema.or(attributeSchema).or(attributeRefSchema).or(metricSchema).array())
		.optional(),
});

export const schemaItemSchema = attributeGroupSchema.or(attributeSchema).or(attributeRefSchema).or(metricSchema);
export type SchemaItem = z.infer<typeof schemaItemSchema>;

export function isAttributeGroup(item: SchemaItem): item is AttributeGroup {
	// @ts-expect-error TypeScript is confused here.
	return "type" in item && typeof item.type === "string" && attributeGroupTypes.includes(item.type);
}

export function isMetric(item: SchemaItem): item is Metric {
	return "type" in item && typeof item.type === "string" && item.type === "metric";
}

export function isAttribute(item: SchemaItem): item is Attribute {
	if (!("type" in item)) {
		return false;
	}

	if (typeof item.type === "object") {
		// enum type schema
		return true;
	}

	// @ts-expect-error TypeScript is confused here.
	return typeof item.type === "string" && attributeTypes.includes(item.type);
}

export const attributeGroupsSchema = z.object({
	groups: schemaItemSchema.array(),
});
export type AttributeGroups = z.infer<typeof attributeGroupsSchema>;
