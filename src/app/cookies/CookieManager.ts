// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

"use server";

import { cookies } from "next/headers";

export async function setCookie() {
	cookies().set({
		name: "otelbin-cookies-accepted",
		value: "true",
		path: "/",
	});
}

export async function setOptOutCookie() {
	cookies().set({
		name: "otelbin-cookies-accepted",
		value: "false",
		path: "/",
	});
}

export async function getCookie() {
	const cookieStore = cookies();
	const savedCookie = cookieStore.get("otelbin-cookies-accepted")?.value;
	return savedCookie;
}
