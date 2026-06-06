import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

export default function minifyJsonPlugin() {
    return {
        name: 'minify-json',
        closeBundle() {
            const __filename = fileURLToPath(import.meta.url)
            const __dirname = path.dirname(__filename)
            const jsonPath = path.resolve(__dirname, '../dist/bundles/gen/compat-data.js')

            if (fs.existsSync(jsonPath)) {
                let content = fs.readFileSync(jsonPath, 'utf-8')

                const originalSize = (content.length / 1024).toFixed(2)
                content = content.replace(/\/\/#(endregion|region).*/g, '').replace(/\s+/g, " ").trim()

                fs.writeFileSync(jsonPath, content)

                const newSize = (content.length / 1024).toFixed(2)

                console.log(`Minified JSON: ${originalSize}KB -> ${newSize}KB`)
            } else {
                console.error("Could not resolve dts path")
            }
        }
    }
}