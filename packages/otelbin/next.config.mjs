// SPDX-FileCopyrightText: 2025 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

/** @type {import("next").NextConfig} */
const config = {
	reactStrictMode: true,
	webpack(config) {
		// In Next.js 16, SVG is bundled into the built-in image asset rules.
		// Remove svg from all existing rules and add @svgr/webpack at the top.
		for (const rule of config.module.rules) {
			if (rule.test instanceof RegExp && rule.test.test(".svg")) {
				rule.test = new RegExp(rule.test.source.replace("|svg", ""), rule.test.flags);
			}
			if (rule.oneOf) {
				for (const oneOfRule of rule.oneOf) {
					if (oneOfRule.test instanceof RegExp && oneOfRule.test.test(".svg")) {
						oneOfRule.test = new RegExp(oneOfRule.test.source.replace("|svg", ""), oneOfRule.test.flags);
					}
				}
			}
		}

		// Add SVGR at the beginning of the rules array so it takes priority
		config.module.rules.unshift({
			test: /\.svg$/i,
			use: [{ loader: "@svgr/webpack", options: { svgo: false } }],
		});

		return config;
	},
	async headers() {
		const headers = [
			{
				key: "X-Frame-Options",
				value: "DENY",
			},
			{
				key: "X-Content-Type-Options",
				value: "nosniff",
			},
			{
				key: "Referrer-Policy",
				value: "origin-when-cross-origin",
			},
			{
				key: "X-Permitted-Cross-Domain-Policies",
				value: "none",
			},
		];

		if (process.env.NODE_ENV === "production") {
			headers.push({
				key: "Strict-Transport-Security",
				value: "max-age=31536000; includeSubDomains",
			});
		}

		return [
			{
				source: "/(.*)",
				headers,
			},
		];
	},
};

export default config;
