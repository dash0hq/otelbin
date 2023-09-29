// SPDX-FileCopyrightText: 2023 Dash0 Inc.
// SPDX-License-Identifier: Apache-2.0

// TODO Remove unused

/** @type {import('tailwindcss').Config} */
module.exports = {
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
				otelbinDarkPurple: "#1D2029",
				otelbinDarkBlue: "#0F172A",
				otelbinDarkBlue2: "#40454E",
				otelbinDarkBlue3: "#4F545D",
				otelbinLightBlue: "#293548",
				otelbinGrey: "#6D737D",
				otelbinLightGrey: "#8491A6",
				otelbinLightGrey2: "#2B3546",
				otelbinBlackGrey: "#030816",
				otelbinRed: "#EE3030",
				otelbinGreen: "#45C175",
				otelbinDarkGreen: "#082313",
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
			},
			keyframes: {
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
			},
			animation: {
				focus: "focus 2s ease-out",
				processorFocus: "processorFocus 2s ease-out",
				connectorFocus: "connectorFocus 2s ease-out",
			},
			transitionProperty: {
				shape: "width, height, border-radius",
			},
			boxShadow: {
				node: "0 3px 3px 3px rgba(7, 8, 16, 0.1)",
			},
		},
	},

	plugins: [require("tailwindcss-animate")],
};
