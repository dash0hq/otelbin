// SPDX-FileCopyrightText: 2024 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

"use client";

import attributes from "./attributes.json";
import Link from "next/link";
import { startTransition, useState } from "react";
import { Input } from "~/components/input";

export default function SemanticConventions() {
	const [search, setSearch] = useState("");

	return (
		<section className="overflow-y-auto max-h-screen">
			<h1>Semantic Conventions</h1>

			<Input
				value={search}
				onChange={(e) => startTransition(() => setSearch(e.currentTarget.value))}
				placeholder="Search..."
			/>

			<ol>
				{attributes
					.filter((attr) => {
						if (!search) return true;
						return attr.key.toLowerCase().includes(search.toLowerCase());
					})
					.sort((a, b) => a.key.localeCompare(b.key))
					.map((attribute) => (
						<li key={`${attribute.context}${attribute.key}`}>
							<Link href={`/semconv/attributes/${encodeURIComponent(attribute.key)}`}>{attribute.key}</Link> (
							{attribute.context})
						</li>
					))}
			</ol>
		</section>
	);
}
