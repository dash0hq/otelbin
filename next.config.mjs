/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */

import path from "path";

/** @type {import("next").NextConfig} */
const config = {
	reactStrictMode: true,
	i18n: {
		locales: ["en"],
		defaultLocale: "en",
	},
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
};

export default config;
