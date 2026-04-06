import { fileURLToPath, pathToFileURL } from "node:url"

/**
 * Get the resolved module path as a string or URL.
 * @param {string} path 
 * @returns {string | URL} module path
 */
export const getModulePath = (path) => {
    try {
        return fileURLToPath(import.meta.resolve(path)) 
    } catch (_error) {
        return pathToFileURL(require.resolve(path)) 
    }
}