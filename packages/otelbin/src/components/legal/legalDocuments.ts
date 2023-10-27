// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

export const legalDocuments = [
	{
		label: "Terms and Conditions",
		url: process.env.NEXT_PUBLIC_TERMS_AND_CONDITIONS_URL ? "/policies/terms" : null,
	},
	{
		label: "Privacy Policy",
		url: process.env.NEXT_PUBLIC_PRIVACY_POLICY_URL ? "/policies/privacy" : null,
	},
	{
		label: "Cookie Policy",
		url: process.env.NEXT_PUBLIC_COOKIE_POLICY_URL ? "/policies/cookies" : null,
	},
	{
		label: "Acceptable Use Policy",
		url: process.env.NEXT_PUBLIC_ACCEPTABLE_USE_URL ? "/policies/acceptable-use" : null,
	},
];
