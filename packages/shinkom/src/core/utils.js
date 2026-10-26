/**@typedef {import('../types/public').CSSConfig} CSSConfig */

/**
 * 
 * @param {string} location 
 * @param {boolean} isNode 
 * @returns the resolved path and type
 */
export async function resolveCSSLocation(location, isNode) {
    if (/^https?:\/\//i.test(location)) {
        return { type: 'url', resolvedPath: location }
    }
    if (isNode) {
        const fs = await import('node:fs/promises')
        const path = await import('node:path')

        const absolutePath = path.isAbsolute(location) ? location : path.resolve(process.cwd(), location)

        try {
            const stats = await fs.stat(absolutePath)

            return {
                type: stats.isDirectory() ? 'directory' : 'file',
                resolvedPath: absolutePath
            }
        } catch {
            throw new Error(`[SKEngine] Provided CSS path does not exist: "${location}" (resolved to ${absolutePath})`)
        }
    } else {
        const resolvedUrl = new URL(location, window.location.href).href
        return {
            type: 'url',
            resolvedPath: resolvedUrl
        }
    }
}

/**
 * 
 * @param {string} pathType 
 * @param {boolean} isNode 
 */
export async function readCSSFiles(pathType, isNode) {
    const resolved = await resolveCSSLocation(pathType, isNode)
    const rawCSSContents = []

    if (resolved.type === 'url') {
        const res = await fetch(resolved.resolvedPath)
        if (!res.ok) {
            throw new Error(`[SKEngine] Failed to fetch CSS file from ${resolved.resolvedPath}: ${res.statusText}`)
        }
        rawCSSContents.push((await res.text()))
    }

    if (isNode) {
        const fs = await import('node:fs/promises')
        const path = await import('node:path')

        /**
         * @param {string} dir 
         * @returns {Promise<string[]>} a Promise<string[]>
         */
        const resolveFilesFromDir = async (dir) => {
            const entries = await fs.readdir(dir, { withFileTypes: true })
            const files = await Promise.all(
                entries.map((entry) => {
                    const res = path.resolve(dir, entry.name)
                    if (entry.isDirectory()) return resolveFilesFromDir(res)
                    return res.endsWith('.css') ? [res] : []
                })
            )
            return files.flat()
        }

        if (resolved.type === 'directory') {
            const files = await resolveFilesFromDir(resolved.resolvedPath)
            for (const file of files) {
                const content = await fs.readFile(file, 'utf-8')
                rawCSSContents.push(content)
            }
        } else if (resolved.type === 'file') {
            const content = await fs.readFile(resolved.resolvedPath, 'utf-8')
            rawCSSContents.push(content)
        }
    }

    return rawCSSContents
}