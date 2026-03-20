import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import wasm from 'vite-plugin-wasm'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    build: {
        lib: {
            entry: resolve(__dirname, 'src/index.js'),
            name: 'BrowserX',
            fileName: 'browserx'
        },
        rollupOptions: {
            external: ['@mdn/browser-compat-data'],
            output: {
                globals: {
                    '@mdn/browser-compat-data': 'mdnCompatData'
                }
            }
        }
    },
    plugins: [
        wasm()
    ]
})