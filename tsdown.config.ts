import pkg from './package.json' with { type: 'json' }
import { defineConfig } from "tsdown";
import path, { dirname } from "node:path";
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const banner = (c: any) => {
    if (c.name.includes('.json')) return "";

    const date = new Date()
    const chunkName = c.name.split('/')
    return `/**
    * Shinkom - ${chunkName.length > 0 ? chunkName[chunkName.length - 1].includes('.') ? chunkName[chunkName.length - 1].split('.')[0] : chunkName[chunkName.length - 1] : c.name.includes('.') ? c.name.split('.')[0] : c.name}
    * @version ${pkg.version}
    * @license ${pkg.license}
    * @copyright ${date.getFullYear()} - Oneil Achord
*/
`
}

export default defineConfig([
    {
        entry: {
            'index': './src/index.js',
            'engine/engine': './src/engine/engine.js',
            'ui/index': './src/ui/index.js',
            'ui/inspector/inspector': './src/ui/inspector/inspector.js',
            'ui/control-panel/control-panel': './src/ui/control-panel/control-panel.js',
            'ui/compatibility-view/compatibility-view': './src/ui/compatibility-view/compatibility-view.js',
            'ui/compat-ui/compat-ui': './src/ui/compat-ui/compat-ui.js',
            'shinkom/shinkom': './src/shinkom/shinkom.js',
            'types/index': './src/types/index.js'
        },
        platform: 'browser',
        outDir: './dist/bundles',
        format: 'esm',
        target: 'esnext',
        dts: true,
        outputOptions: {
            preserveModules: true,
            preserveModulesRoot: 'src',
            chunkFileNames: '[name][format]',
            postBanner: banner
        },
        report: {
            gzip: false
        },
        plugins: [
            {
                name: 'copy-wasm-asset',
                closeBundle() {
                    const __filename = fileURLToPath(import.meta.url)
                    const __dirname = dirname(__filename)
                    const wasmFile = path.resolve(__dirname, 'pkg/shinkore_bg.wasm')
                    const distPath = path.resolve(__dirname, 'dist/bundles/pkg')
                    const wasmDistFile = path.resolve(distPath, 'shinkore_bg.wasm')

                    if (!existsSync(distPath)) {
                        mkdirSync(distPath, { recursive: true })
                    }

                    if (existsSync(wasmFile)) {
                        copyFileSync(wasmFile, wasmDistFile)

                        console.log("Successfully copied wasm asset file to pkg!")
                    } else {
                        console.error("Could not find the wasm file at:", wasmFile)
                    }
                }
            },
            {
                name: 'minify-json',
                closeBundle() {
                    const __filename = fileURLToPath(import.meta.url)
                    const __dirname = dirname(__filename)
                    const jsonPath = path.resolve(__dirname, 'dist/bundles/gen/compat-data.js')

                    if (existsSync(jsonPath)) {
                        let content = readFileSync(jsonPath, 'utf-8')

                        const originalSize = (content.length / 1024).toFixed(2)
                        content = content.replace(/\/\/#(endregion|region).*/g, '').replace(/\s+/g, " ").trim()

                        writeFileSync(jsonPath, content)

                        const newSize = (content.length / 1024).toFixed(2)

                        console.log(`Minified JSON: ${originalSize}KB -> ${newSize}KB`)
                    } else {
                        console.error("Could not resolve dts path")
                    }
                }
            },
        ],
    },
    {
        entry: {
            'index': './src/index.js',
            'engine/engine': './src/engine/engine.js',
            'ui/index': './src/ui/index.js',
            'ui/inspector/inspector': './src/ui/inspector/inspector.js',
            'ui/control-panel/control-panel': './src/ui/control-panel/control-panel.js',
            'ui/compatibility-view/compatibility-view': './src/ui/compatibility-view/compatibility-view.js',
            'ui/compat-ui/compat-ui': './src/ui/compat-ui/compat-ui.js',
            'shinkom/shinkom': './src/shinkom/shinkom.js',
            'types/index': './src/types/index.js'
        },
        platform: 'node',
        outDir: './dist/modules',
        format: 'cjs',
        target: 'esnext',
        minify: true,
        dts: false,
        outputOptions: {
            preserveModules: true,
            preserveModulesRoot: 'src',
            entryFileNames: '[name].cjs',
            chunkFileNames: '[name].cjs',
            assetFileNames: 'pkg/[name].wasm',
        },
        report: {
            gzip: false
        },
        plugins: [
            {
                name: 'copy-wasm-asset',
                closeBundle() {
                    const __filename = fileURLToPath(import.meta.url)
                    const __dirname = dirname(__filename)
                    const wasmFile = path.resolve(__dirname, 'pkg/shinkore_bg.wasm')
                    const distPath = path.resolve(__dirname, 'dist/modules/pkg')
                    const wasmDistFile = path.resolve(distPath, 'shinkore_bg.wasm')

                    if (!existsSync(distPath)) {
                        mkdirSync(distPath, { recursive: true })
                    }

                    if (existsSync(wasmFile)) {
                        copyFileSync(wasmFile, wasmDistFile)

                        console.log("Successfully copied wasm asset file to pkg!")
                    } else {
                        console.error("Could not find the wasm file at:", wasmFile)
                    }
                }
            }
        ],
    },
])