// SPDX-FileCopyrightText: 2024 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import attributes from "../../attributes.json";
import { notFound } from "next/navigation";

export function generateStaticParams() {
	return attributes.map((a) => ({
		key: a.key,
	}));
}

export default function Attribute({ params: { key } }: { params: { key: string } }) {
	const attribute = attributes.find((a) => a.key === key);
	if (!attribute) {
		notFound();
	}

	return (
		<section>
			<h1>{attribute.key}</h1>

			<pre>{JSON.stringify(attribute, undefined, 2)}</pre>
		</section>
	);
}
