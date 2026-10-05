/// <reference types="vite/client" />

import { Shinkom } from '../../src/index'
import wasm from '../../pkg/shinkore_bg.wasm?url'
import maincss from './css/main.css?raw'

const shinkom = new Shinkom({
    inspector: {
        disabled: false,
        keyboardShortcuts: true
    },
    engine: {
        wasmURL: wasm,
        css: {
            externalCSS: {
                imports: [maincss]
            }
        }
    }
})

shinkom.init()
