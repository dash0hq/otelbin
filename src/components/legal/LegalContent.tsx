// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import { legalDocuments } from "~/components/legal/legalDocuments";

export function LegalContent() {
	return (
		<div>
			<ul className="mx-4 my-3 text-sm font-normal text-subtl">
				{legalDocuments.map((doc) => (
					<li key={doc.label}>
						<a href={doc.url} target="_blank" className="hover:text-default">
							{doc.label}
						</a>
					</li>
				))}
			</ul>
		</div>
	);
}
