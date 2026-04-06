/**
 * Get the resolved module path.
 * @param {string} path 
 * @returns {string} module path
 */
export const getModulePath = (path) => {
    try {
        return import.meta.resolve(path)
    } catch (_error) {
        return require.resolve(path)
    }
}