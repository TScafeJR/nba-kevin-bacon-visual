import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';

// the API runs as its own process (server/index.ts); both servers pass /api on to it
const api = `http://localhost:${process.env.API_PORT ?? 3001}`;

export default defineConfig({
    plugins: [react()],
    server: {
        port: 3000,
        proxy: { '/api': api }
    },
    preview: {
        proxy: { '/api': api }
    },
    build: {
        // the player data ships in the bundle, so the main chunk is legitimately large
        chunkSizeWarningLimit: 16000
    },
    test: {
        projects: [
            {
                extends: true,
                test: {
                    name: 'unit',
                    include: ['test/unit/**/*.spec.ts'],
                    environment: 'node'
                }
            },
            // every story, rendered in headless Chromium and checked for accessibility
            {
                extends: true,
                plugins: [storybookTest({ configDir: fileURLToPath(new URL('.storybook', import.meta.url)) })],
                test: {
                    name: 'storybook',
                    browser: {
                        enabled: true,
                        headless: true,
                        provider: playwright({}),
                        instances: [{ browser: 'chromium' }]
                    }
                }
            }
        ]
    }
});
