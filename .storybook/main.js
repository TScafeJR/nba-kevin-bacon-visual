module.exports = {
  "stories": [
    "../src/**/*.stories.mdx",
    "../src/**/*.stories.@(js|jsx|ts|tsx)",
    "../src/**/**/*.stories.@(js|jsx|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-links",
    "@storybook/addon-essentials"
  ],
  // The default react-docgen-typescript plugin in Storybook 6.0 uses compiler APIs removed in TypeScript 5
  "typescript": {
    "reactDocgen": "react-docgen"
  }
}
