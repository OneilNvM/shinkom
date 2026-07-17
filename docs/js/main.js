/// <reference types="vite/client" />

import { CompatInspector, CompatControlPanel, CompatView, CompatUI, ShinkomBus, ShinkomState, SKEngine } from '../lib/shinkom-lib'
import { EditorView } from 'https://cdn.jsdelivr.net/npm/codemirror@6.0.2/+esm'
import wasm from '../pkg/shinkore_bg.wasm?url'
import { colorizeJson } from './helpers'

// Setup Shinkom components

const bus = new ShinkomBus()
const state = new ShinkomState()
const inspector = new CompatInspector(bus, state, { disabled: false })
const controlPanel = new CompatControlPanel(bus, state)
const compatView = new CompatView(bus, state)
const compatUI = new CompatUI(bus, state, [
    inspector,
    controlPanel,
    compatView
])
const engine = new SKEngine(bus)

// Create Shinkom initializer

const initialiseButton = document.getElementById('sk-initializer')

const run = async () => {
    compatUI.init()
    bus.emit('ci:toggle')
    await engine.initEngine(wasm)
}

initialiseButton.addEventListener('click', async () => {
    try {
        if (!engine.initialized) {
            await run()
            inspectorDemoOutput.innerHTML = `✅ WASM initialized successfully!`
        }
    } catch (error) {
        inspectorDemoOutput.innerHTML = `❌ WASM initialization error: ${error.message}`
    }

})

// Setup CompatInspector demo container

const inspectorDemoOutput = document.getElementById('inspector-demo-output')
const demoInspector = document.getElementById('demo-inspector')
// const view = new EditorView({
//     parent: document.body,
//     doc: "Hello",
// })

demoInspector.addEventListener('pointerenter', () => {
    if (inspector.inspectorEl && !state.getState().inspectorActive) {
        bus.emit('ci:toggle')

        inspector.inspectorEl.style.opacity = '100'
    }
})

demoInspector.addEventListener('pointerleave', () => {
    if (inspector.inspectorEl && state.getState().inspectorActive) {
        bus.emit('ci:toggle')
        inspector.inspectorEl.style.opacity = '0'
    }
})

bus.on('results:ready', (e) => {
    if (inspector.frozenTarget) {
        inspectorDemoOutput.innerHTML = colorizeJson(e)
    }
})