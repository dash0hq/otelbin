// SPDX-FileCopyrightText: 2024 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { type EnumType, type ExamplePrimitive, type PrimitiveAttributeType } from "./semanticConventionsSchema";

export type AttributeContext = "resource" | "span" | "event" | "metric";

export interface Attribute {
	key: string;
	context: AttributeContext;
	type: PrimitiveAttributeType | "enum";
	enum?: EnumType;
	brief: string;
	examples: ExamplePrimitive[];
	note?: string;
}
