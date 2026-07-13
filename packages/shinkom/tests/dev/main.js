/// <reference types="vite/client" />

import { Shinkom } from '../../src/index'
import wasm from '../../pkg/shinkore_bg.wasm?url'

const shinkom = new Shinkom({
    inspector: {
        disabled: false,
        keyboardShortcuts: true
    },
    engine: {
        wasmURL: wasm
    }
})

shinkom.init()
