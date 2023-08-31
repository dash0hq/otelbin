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

module.exports.theme.extend.colors.otelbinPurple = "#6366F1";
module.exports.theme.extend.colors.otelbinDarkPurple = "#1D2029";
module.exports.theme.extend.colors.otelbinDarkBlue = "#0F172A";
module.exports.theme.extend.colors.otelbinDarkBlue2 = "#40454E";
module.exports.theme.extend.colors.otelbinDarkBlue3 = "#4F545D";
module.exports.theme.extend.colors.otelbinLightBlue = "#293548";
module.exports.theme.extend.colors.otelbinGrey = "#6D737D";
module.exports.theme.extend.colors.otelbinLightGrey = "#8491A6";
module.exports.theme.extend.colors.otelbinLightGrey2 = "#2B3546";
module.exports.theme.extend.colors.otelbinBlackGrey = "#030816";
module.exports.theme.extend.colors.otelbinMagenta = "#C93A76";
module.exports.theme.extend.keyframes = {
	focus: {
		"0%": {
			border: "1px solid #4F46E5",
		},
		"100%": {
			border: "none",
		},
	},
	processorFocus: {
		"0%": {
			border: "1px solid #F59E0B",
		},
		"100%": {
			border: "none",
		},
	},
};
module.exports.theme.extend.animation = {
	focus: "focus 2s ease-out",
	processorFocus: "processorFocus 2s ease-out",
};
