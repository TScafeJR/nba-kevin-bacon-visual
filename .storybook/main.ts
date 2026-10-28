import type { StorybookConfig } from '@storybook/react-vite';

// addon-mcp serves an MCP server at http://localhost:6007/mcp (see .mcp.json), through which an AI
// client can list components, read their docs, preview stories and run their tests. Those tests
// run on addon-vitest, which plays each story in a real browser, checked by addon-a11y.
const config: StorybookConfig = {
    stories: [
        '../src/**/*.mdx',
        '../src/**/*.stories.@(ts|tsx)'
    ],
    addons: [
        '@storybook/addon-docs',
        '@storybook/addon-a11y',
        '@storybook/addon-vitest',
        '@storybook/addon-mcp'
    ],
    framework: '@storybook/react-vite'
};

export default config;
