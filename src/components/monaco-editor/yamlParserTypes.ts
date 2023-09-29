// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

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
