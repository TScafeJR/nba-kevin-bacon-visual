import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';
import { mergeConfig } from 'vite';

// addon-mcp serves an MCP server at http://localhost:6007/mcp (see .mcp.json), through which an AI
// client can list components, read their docs, preview stories and run their tests. Those tests
// run on addon-vitest, which plays each story in a real browser, checked by addon-a11y.
const fixture = (file: string): string => fileURLToPath(new URL(`../src/stories/fixtures/${file}`, import.meta.url));

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
    framework: '@storybook/react-vite',
    // the stories need a few hundred players, not all 5,416: the two player files resolve to the
    // slice scripts/build-story-fixtures.ts writes, real data at a ninth of the size
    viteFinal: async viteConfig => mergeConfig(viteConfig, {
        resolve: {
            alias: [
                { find: /^.*\/players-obj\.json$/, replacement: fixture('players-obj.json') },
                { find: /^.*\/player-data3\.json$/, replacement: fixture('player-data3.json') }
            ]
        }
    })
};

export default config;
