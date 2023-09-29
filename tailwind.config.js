// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

// eslint-disable-next-line @typescript-eslint/no-var-requires
const plugin = require("tailwindcss/plugin");

// TODO Remove unused

/** @type {import('tailwindcss').Config} */
module.exports = {
	darkMode: ["class"],
	presets: [require("./src/design-tokens/tailwind.preset.js")],
	content: [
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/icons/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
	],
	theme: {
		container: {
			center: true,
			padding: "2rem",
			screens: {
				"2xl": "1400px",
			},
		},
		extend: {
			colors: {
				border: "hsl(var(--border))",
				input: "hsl(var(--input))",
				ring: "hsl(var(--ring))",
				background: "hsl(var(--background))",
				foreground: "hsl(var(--foreground))",
				primary: {
					// DEFAULT: "hsl(var(--primary))", /* Defined in our design tokens */
					foreground: "hsl(var(--primary-foreground))",
				},
				secondary: {
					DEFAULT: "hsl(var(--secondary))",
					foreground: "hsl(var(--secondary-foreground))",
				},
				destructive: {
					DEFAULT: "hsl(var(--destructive))",
					foreground: "hsl(var(--destructive-foreground))",
				},
				muted: {
					DEFAULT: "hsl(var(--muted))",
					foreground: "hsl(var(--muted-foreground))",
				},
				accent: {
					DEFAULT: "hsl(var(--accent))",
					foreground: "hsl(var(--accent-foreground))",
				},
				card: {
					DEFAULT: "hsl(var(--card))",
					foreground: "hsl(var(--card-foreground))",
				},
			},
			keyframes: {
				"accordion-down": {
					from: { height: 0 },
					to: { height: "var(--radix-accordion-content-height)" },
				},
				"accordion-up": {
					from: { height: "var(--radix-accordion-content-height)" },
					to: { height: 0 },
				},
			},
			animation: {
				"accordion-down": "accordion-down 0.2s ease-out",
				"accordion-up": "accordion-up 0.2s ease-out",
			},
			transitionProperty: {
				shape: "width, height, border-radius",
			},
		},
	},

	plugins: [
		require("tailwindcss-animate"),
		plugin(function ({ addVariant }) {
			// Shortcut to style when sidebar is collapsed, e.g. <div className="sidebar-collapsed:hidden"/>
			addVariant("main-navigation-collapsed", '[data-main-navigation-collapsed="true"] &');
		}),
	],
};

// TODO merge into theme at proper location

module.exports.theme.extend.colors.otelbinDarkPurple = "#1D2029";
module.exports.theme.extend.colors.otelbinDarkBlue = "#0F172A";
module.exports.theme.extend.colors.otelbinDarkBlue2 = "#40454E";
module.exports.theme.extend.colors.otelbinDarkBlue3 = "#4F545D";
module.exports.theme.extend.colors.otelbinLightBlue = "#293548";
module.exports.theme.extend.colors.otelbinGrey = "#6D737D";
module.exports.theme.extend.colors.otelbinLightGrey = "#8491A6";
module.exports.theme.extend.colors.otelbinLightGrey2 = "#2B3546";
module.exports.theme.extend.colors.otelbinBlackGrey = "#030816";
module.exports.theme.extend.colors.otelbinRed = "#EE3030";
module.exports.theme.extend.colors.otelbinGreen = "#45C175";
module.exports.theme.extend.colors.otelbinDarkGreen = "#082313";
module.exports.theme.extend.boxShadow = {
	node: "0 3px 3px 3px rgba(7, 8, 16, 0.1)",
};
module.exports.theme.extend.keyframes = {
	focus: {
		"0%": {
			border: "0.5px solid #A78BFA",
		},
		"100%": {
			border: "none",
		},
	},
	processorFocus: {
		"0%": {
			border: "0.5px solid #818CF8",
		},
		"100%": {
			border: "none",
		},
	},
	connectorFocus: {
		"0%": {
			border: "0.5px solid #62D08D",
		},
		"100%": {
			border: "none",
		},
	},
};

module.exports.theme.extend.animation = {
	focus: "focus 2s ease-out",
	processorFocus: "processorFocus 2s ease-out",
	connectorFocus: "connectorFocus 2s ease-out",
};
