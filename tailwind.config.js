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
