import { CompatControlPanelElement, CompatViewElement } from '../core/elements';
import { SupportStatement } from './types';

export type ShinkomConfig = {
    inspector?: InspectorConfig
    engine?: EngineConfig
}

export type InspectorConfig = {
    disabled: boolean;
    keyboardShortcuts?: boolean;
}

export type EngineConfig = {
    wasmURL?: string;
    css?: CSSConfig
}

/**
 * Engine configuration for CSS parsing and compatibility checking.
 * 
 * # External CSS Stylesheets
 * The `externalCSS` field uses specific file path conventions to find `.css` files
 * appropriately. Due to the flexibility of the engine, it uses two different methods
 * for finding CSS files depending on the environment the engine is used in (browser or Node).
 * 
 * # Files vs Directories
 * The `files` and `directories` fields are exclusive to Node environments and **should not be used in
 * the browser**. By using the `files` field, pass an array of CSS file paths.
 * When using the `directories` field, any CSS file within the directory will be read and written
 * to the engine. Pass an array of directories containing CSS files. Note that file paths 
 * **must be relative paths**. Will recursively search other directories.
 * 
 * # Imports
 * The `imports` field can be used in browser environments by directly importing raw CSS files.
 * Since bundlers return CSS in JavaScript when the fetch method is used to find CSS files, this
 * strategy allows for direct passing of raw CSS strings from imports to work across multiple bundlers.
 * 
 * ## Node Paths
 * Simply pass a file path or directory (or multiple of either) to find CSS files
 * * `files` option
 *      - `./styles/main.css`
 *      - `['./styles/main.css', './styles/globals.css']`
 * * `directories` option
 *      - `./assets/css`
 *      - `['./css/home', './css/shop']`
 * 
 * ## Browser imports
 * Import CSS files and pass the raw content to the `imports` field.
 * * Vite
 *      - `import maincss from './styles/main.css?raw`
 * * WebPack
 *      - `import maincss from './main.css' with { type: "text" }`
 * 
 * Alternative: Refer to the [source type section](https://webpack.js.org/guides/asset-modules/)
 * in WebPack documentation to make a rule to import CSS source code.
 * ## Absolute URLs
 * Absolute URLs can be used for both environments.
 * * `https://localhost:5173/main.css`
 */
export type CSSConfig = {
    externalCSS: {
        imports?: string[],
        files?: string[]
        directories?: string[]
    }
}

export type UISharedState = {
    inspectorExists: boolean;
    inspectorActive: boolean;
    inspectorSwitching: boolean;
    multiElements: boolean;
    depthLevel: number;
    ignorePanelEl: CompatControlPanelElement | null;
    ignoreCompatViewEl: CompatViewElement | null;
    compatViewTab: "overview" | "results" | "history";
    maxResultsHistory: number;
}

export type UISharedStateProps = keyof UISharedState

export type CompatResult = {
    overall_score: number;
    lookup_results: LookupResult[];
}

export type CompatSnapshot = CompatResult & {
    checkedAt: string
}

export type LookupResult = {
    name: string;
    mdn_url: string;
    compat_score: string;
    browser_score: string;
    status_score: string;
    browsers: BrowserResult[];
}

export type BrowserResult = {
    browser_name: string;
    score: {
        raw_score: string;
        weighted_score: string;
    };
    versions: SupportStatement
}