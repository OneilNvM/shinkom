import { defineConfig } from 'vite'
import { resolve } from 'node:path'
import pkg from './package.json'

export default defineConfig({
    base: '/shinkom/',
    build: {
        outDir: '../../docs/lib',
        emptyOutDir: true,
        lib: {
            entry: resolve(import.meta.dirname, 'src/index.js'),
            name: 'ShinkomLib',
            fileName: 'shinkom-lib',
            formats: ["es", "umd"]
        },
        rolldownOptions: {
            transform: {
                define: {
                    'import.meta': '{}',
                    __PACKAGE_VERSION__: JSON.stringify(pkg.version)
                }
            },
            external: ['@mdn/browser-compat-data', 'caniuse-db', /^node(:.*)?/],
        }
    },
    server: {
        open: 'tests/dev/index.html'
    }
})