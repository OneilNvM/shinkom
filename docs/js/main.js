/// <reference types="vite/client" />

import { CompatInspector, CompatControlPanel, CompatView, CompatUI, ShinkomBus, ShinkomState, SKEngine } from '../lib/shinkom-lib'
import { EditorView } from 'https://cdn.jsdelivr.net/npm/codemirror@6.0.2/+esm'
import wasm from '../pkg/shinkore_bg.wasm?url'
import { colorizeJson } from './helpers'

let showPanelButton;
let closePanelButton;

// Setup functions

const addShowPanelEvent = () => {
    showPanelButton = controlPanel.controlPanelEl.shadowRootRef.getElementById('sk-show-panel')

    if (showPanelButton) {
        showPanelButton.addEventListener('click', () => {
            const para1 = document.createElement('p')
            const list = document.createElement('ul')
            const features = [
                "Element switching",
                "Multi-element checking",
                "Inspector lifecycle features",
                "Changing the maximum number of results stored",
                "Clearing results history"
            ]
            para1.innerHTML = "The control panel provides the options to enable features for the Inspector and Compatibility View such as:"

            for (const feature of features) {
                const item = document.createElement('li')
                item.innerHTML = feature

                list.appendChild(item)
            }

            const summaryDetail = document.getElementById('sect-ccp-summary-detail')
            if (summaryDetail) {
                summaryDetail.replaceChildren(para1, list)
            }

            showPanelButton.style.opacity = '0'
        })
    }
}

const addClosePanelEvent = () => {
    closePanelButton = controlPanel.controlPanelEl.shadowRootRef.getElementById('sk-close-panel')

    if (closePanelButton) {
        closePanelButton.addEventListener('click', () => {
            // controlPanel.controlPanelEl.style.display = 'none'
        })
    }
}

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

const runEngineInit = async () => await engine.initEngine(wasm)

const runUIInit = async () => {
    compatUI.init()
    bus.emit('ci:toggle')

    addShowPanelEvent()
    addClosePanelEvent()

    showPanelButton.part = "sk-show-panel"
    controlPanel.controlPanelEl.shadowRootRef.getElementById('sk-shadow-host').part = "sk-control-panel"
}

initialiseButton.addEventListener('click', async () => {
    try {
        if (!inspector.inspectorEl && !controlPanel.controlPanelEl && !compatView.compatViewEl) {
            await runUIInit()
        }
    } catch (error) {
        console.error(`Failed to initialise UI components: ${error.message}`)
    }
    try {
        if (!engine.initialized) {
            inspectorDemoOutput.innerHTML = `🔃 Initializing WASM binary...`
            await runEngineInit()
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

if (demoInspector) {
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
}

bus.on('results:ready', (e) => {
    if (inspector.frozenTarget && inspectorDemoOutput) {
        inspectorDemoOutput.innerHTML = colorizeJson(e)
    }
})

// Setup CompatControlPanel demo
