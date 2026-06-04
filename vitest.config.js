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
                    setupFiles: ['tests/setup_files/stylesheets.ts', 'tests/setup_files/localstorage.ts']
                }
            },
            {
                extends: true,
                test: {
                    name: 'engine',
                    include: ['tests/engine/**/*.test.js'],
                    setupFiles: ['tests/setup_files/stylesheets.ts']
                }
            }
        ],
        setupFiles: ['tests/setup_files/webassembly.ts'],
        globals: true
    }
})