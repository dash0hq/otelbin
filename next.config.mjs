/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */

import path from "path";

/** @type {import("next").NextConfig} */
const config = {
	reactStrictMode: true,
	transpilePackages: ["@dash0hq/ui"],
	webpack(config) {
		config.module.rules.push({
			test: /\.svg$/i,
			issuer: /\.[jt]sx?$/,
			use: ["@svgr/webpack"],
		});
		config.resolve.alias = {
			...config.resolve.alias,
			"@dash0": path.join(process.cwd(), "node_modules", "@dash0hq", "ui", "src"),
		};

		return config;
	},
	async headers() {
		const headers = [
			{
				key: 'X-Frame-Options',
				value: 'DENY',
			},
			{
				key: 'X-Content-Type-Options',
				value: 'nosniff',
			},
			{
				key: 'Referrer-Policy',
				value: 'origin-when-cross-origin',
			},
			{
				key: 'X-Permitted-Cross-Domain-Policies',
				value : 'none'
			}
		];

		if (process.env.NODE_ENV === 'production') {
			headers.push({
				key: 'Strict-Transport-Security',
				value: 'max-age=31536000; includeSubDomains'
			})
		}

		return [
			{
				source: '/(.*)',
				headers,
			},
		];
	}
};

export default config;
