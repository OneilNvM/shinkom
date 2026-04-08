/**
 * Get the resolved module path as a string or URL.
 * @param {string} modulePath 
 * @returns {Promise<string | URL>} module path
 */
export const getModulePath = async (modulePath) => {
    const path = await import("node:url")
    const module = await import("node:module")
    try {
        const require = module.createRequire(import.meta.url)
        
        const mPath = require.resolve(modulePath)
        return mPath
    } catch (_error) {
        return path.pathToFileURL(require.resolve(modulePath))
    }
}