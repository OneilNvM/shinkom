import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";

export default function copyWasmPlugin(format: "bundles" | "modules") {
    return {
        name: 'copy-wasm-asset',
        closeBundle() {
            const __filename = fileURLToPath(import.meta.url)
            const __dirname = path.dirname(__filename)
            const wasmFile = path.resolve(__dirname, '../pkg/shinkore_bg.wasm')
            const distPath = path.resolve(__dirname, `../dist/${format}/pkg`)
            const wasmDistFile = path.resolve(distPath, 'shinkore_bg.wasm')

            if (!fs.existsSync(distPath)) {
                fs.mkdirSync(distPath, { recursive: true })
            }

            if (fs.existsSync(wasmFile)) {
                fs.copyFileSync(wasmFile, wasmDistFile)

                console.log("Successfully copied wasm asset file to pkg!")
            } else {
                console.error("Could not find the wasm file at:", wasmFile)
            }
        }
    }
}