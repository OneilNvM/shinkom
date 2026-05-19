import { defineConfig } from "vitest/config";

export default defineConfig({
    test: {
        environment: 'node',
        projects: [
            {
                extends: true,
                test: {
                    name: 'ui',
                    environment: 'jsdom',
                    include: ['tests/client/**/*.test.js'],
                    setupFiles: ['tests/setup_files/stylesheets.ts']
                }
            },
            {
                test: {
                    name: 'engine',
                    include: ['tests/engine/**/*.test.js'],
                    setupFiles: ['tests/setup_files/webassembly.ts', 'tests/setup_files/stylesheets.ts']
                }
            }
        ],
        globals: true
    }
})