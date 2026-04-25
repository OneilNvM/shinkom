import pkg from './package.json' with { type: 'json' }
import { defineConfig } from "tsdown";
import copyWasmPlugin from './plugins/copyWasmPlugin';
import minifyJsonPlugin from './plugins/minifyJsonPlugin';

const banner = (c: any) => {
    if (c.name.includes('.json')) return "";

    const fileNames: string[] = c.fileName.split('/');

    const fileName: string = fileNames.length > 1 ? fileNames[fileNames.length - 2] : c.name.split('.')[0]

    const date = new Date()

    return `/**
    * Shinkom - ${fileName}
    * @version ${pkg.version}
    * @license ${pkg.license}
    * @copyright ${date.getFullYear()} - OneilNvM
*/
`
}

export default defineConfig([
    {
        entry: {
            'index': './src/index.js',
            'shinkom': './src/shinkom.js',
            'core/index': './src/core/index.js',
            'core/event-bus': './src/core/event-bus.js',
            'core/state-service': './src/core/state-service.js',
            'core/ui-component': './src/core/ui-component.js',
            'core/constants': './src/core/constants.js',
            'engine/engine': './src/engine/engine.js',
            'ui/index': './src/ui/index.js',
            'ui/inspector/inspector': './src/ui/inspector/inspector.js',
            'ui/control-panel/control-panel': './src/ui/control-panel/control-panel.js',
            'ui/compat-ui/compat-ui': './src/ui/compat-ui/compat-ui.js',
        },
        platform: 'browser',
        outDir: './dist/bundles',
        format: 'esm',
        target: 'esnext',
        dts: true,
        deps: {
            neverBundle: [/^node(:.*)?/]
        },
        outputOptions: {
            preserveModules: true,
            preserveModulesRoot: 'src',
            chunkFileNames: '[name][format]',
            postBanner: banner
        },
        report: {
            gzip: false
        },
        plugins: [copyWasmPlugin("bundles"), minifyJsonPlugin()],
    },
    {
        entry: {
            'index': './src/index.js',
            'shinkom': './src/shinkom.js',
            'core/index': './src/core/index.js',
            'core/event-bus': './src/core/event-bus.js',
            'core/state-service': './src/core/state-service.js',
            'core/ui-component': './src/core/ui-component.js',
            'core/constants': './src/core/constants.js',
            'engine/engine': './src/engine/engine.js',
            'ui/index': './src/ui/index.js',
            'ui/inspector/inspector': './src/ui/inspector/inspector.js',
            'ui/control-panel/control-panel': './src/ui/control-panel/control-panel.js',
            'ui/compat-ui/compat-ui': './src/ui/compat-ui/compat-ui.js',
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
        define: {
            'import.meta': '{}'
        },
        plugins: [copyWasmPlugin("modules")],
    },
])