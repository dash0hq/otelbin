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
    ...ossTailwindConfig.content.map((p) =>
      path.join(__dirname, "node_modules", "@dash0hq/ui", p)
    ),
  ],
};

module.exports.theme.extend.colors.otelbinPurple = "#6366F1";
module.exports.theme.extend.colors.otelbinDarkBlue = "#0F172A";
module.exports.theme.extend.colors.otelbinLightBlue = "#293548";
module.exports.theme.extend.colors.otelbinGrey = "#6D737D";
module.exports.theme.extend.colors.otelbinLightGrey = "#8491A6";
module.exports.theme.extend.colors.otelbinBlackGrey = "#030816";
module.exports.theme.extend.colors.otelbinMagenta = "#C93A76";

