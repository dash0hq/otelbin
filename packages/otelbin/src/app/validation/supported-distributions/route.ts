// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

import retryFetch from "fetch-retry";
import { NextResponse } from "next/server";
import { assertValue } from "~/lib/env";

export async function GET(): Promise<NextResponse> {
	let response: Response;

	try {
		response = await retryFetch(fetch)(
			`${assertValue(
				process.env.COLLECTOR_CONFIGURATION_VALIDATION_URL,
				"COLLECTOR_CONFIGURATION_VALIDATION_URL env var is not configured"
			)}/validation/supported-distributions`,
			{
				headers: {
					"X-API-KEY": assertValue(
						process.env.COLLECTOR_CONFIGURATION_VALIDATION_API_KEY,
						"COLLECTOR_CONFIGURATION_VALIDATION_API_KEY env var is not configured"
					),
				},
				retries: 3,
				retryDelay: 1000,
				retryOn: [500, 503],
			}
		);
	} catch (e) {
		console.error("Failed to retrieve supported distros", e);

		return NextResponse.json(
			{
				error: "Failed to retrieve supported distributions",
			},
			{ status: 500 }
		);
	}

	if (!response.ok) {
		const body = await response.text();
		return NextResponse.json(
			{
				error: body,
			},
			{ status: response.status }
		);
	}

	const body = await response.json();
	return NextResponse.json(body, {
		headers: {
			"Cache-Control": "max-age=120, stale-while-revalidate=600",
		},
	});
}
