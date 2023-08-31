/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */

import path from "path";

await import("./src/env.mjs");

/** @type {import("next").NextConfig} */
const config = {
	reactStrictMode: true,

	/**
	 * If you have `experimental: { appDir: true }` set, then you must comment the below `i18n` config
	 * out.
	 *
	 * @see https://github.com/vercel/next.js/issues/41980
	 */
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
