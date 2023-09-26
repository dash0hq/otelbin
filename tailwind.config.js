// eslint-disable-next-line @typescript-eslint/no-var-requires
const ossTailwindConfig = require("@dash0hq/ui/tailwind.config");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require("path");

/** @type {import('tailwindcss').Config} */
module.exports = {
	...ossTailwindConfig,

	content: [
		// for dash0-admin
		...ossTailwindConfig.content,
		// for dash0-oss
		...ossTailwindConfig.content.map((p) => path.join(__dirname, "node_modules", "@dash0hq/ui", p)),
	],
};

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
