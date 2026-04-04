import { vi } from "vitest";
import fs from 'node:fs'

vi.stubGlobal('fetch', async (input: string | URL | Request) => {
    const wasmURL = typeof input === 'string'
        ? input
        : (input as Request).url || (input as URL).href

    if (wasmURL.endsWith('.wasm')) {
        const wasmSource = await fs.promises.readFile("pkg/shinkore_bg.wasm");
        const wasmModule = await WebAssembly.compile(wasmSource);

        return wasmModule
    }

    return fetch(input)
})