// @vitest-environment jsdom

import { afterEach, describe, expect, it, test, beforeEach, vi } from "vitest";
import { CompatControlPanel, CompatInspector, CompatUI } from "../../src";
import { SKEngineProxy } from "../../src/engine/engine-proxy";
import { ShinkomBus, ShinkomState } from "../../src/core";
const bus = new ShinkomBus()
const skEngine = new SKEngineProxy(bus)

describe("Power the Shinkore WASM engine", () => {
    test("should set the CompatEngine in Browser environment", async () => {
        await skEngine.initEngine()

        expect(skEngine.initialized).not.toBe(false)

        await skEngine.destroy()
    })
})

describe("Analyze compatibility of HTML elements and attributes", () => {
    const state = new ShinkomState()
    const inspector = new CompatInspector(bus, state)
    const controlPanel = new CompatControlPanel(bus, state)
    const compatUI = new CompatUI(bus, state, [
        inspector,
        controlPanel
    ])

    beforeEach(async () => {
        await skEngine.initEngine()
        compatUI.init()
    })

    afterEach(async () => {
        await skEngine.destroy()
        compatUI.destroy()
        document.body.innerHTML = ""

        vi.restoreAllMocks()
    })

    it("should console.dir <video> tag with a score of 100", async () => {
        const dirSpy = vi.spyOn(console, 'dir')

        document.body.innerHTML = `
            <div>
                <video></video>
            </div>
        `

        const videoTag = document.querySelector('video')

        videoTag.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        vi.waitFor(() => {
            expect(dirSpy).toHaveBeenCalled()
        })
    })

    it("should console.dir <big> with a score of 0", async () => {
        const dirSpy = vi.spyOn(console, 'dir')

        document.body.innerHTML = `
            <div>
                <big>This is some big text.</big>
            </div>
        `

        const bigTag = document.getElementsByTagName('big')[0]

        bigTag.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        vi.waitFor(() => {
            expect(dirSpy).toHaveBeenCalled()
        })
    })

    it("should console.dir <main> <h1> <p> <div> <button> and all of their attributes", async () => {
        const dirSpy = vi.spyOn(console, 'dir')
        controlPanel.multiElements = true
        controlPanel.depthLevel = 1

        document.body.innerHTML = `
            <main id="main-container">
                <h1>Shinkom</h1>
                <p class="bold-text">The high-speed rail cross-browser compatibility tool for developers</p>
                <div class="div-container" align="center">
                    <span class="inner-span">Inner span element</span>
                </div>
                <button id="get-started">Get Started</button>
            </main>
        `

        const main = document.getElementById('main-container')

        main?.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        vi.waitFor(() => {
            expect(dirSpy).toHaveBeenCalled()
        })
    })

    it("should console.dir all elements and their attributes", async () => {
        const dirSpy = vi.spyOn(console, 'dir')
        controlPanel.multiElements = true
        controlPanel.depthLevel = 2

        document.body.innerHTML = `
            <main id="main-container">
                <h1>Shinkom</h1>
                <p class="bold-text">The high-speed rail cross-browser compatibility tool for developers</p>
                <div class="div-container" align="center">
                    <span class="inner-span">Inner span element</span>
                </div>
                <button id="get-started">Get Started</button>
            </main>
        `

        const main = document.getElementById('main-container')

        main?.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        vi.waitFor(() => {
            expect(dirSpy).toHaveBeenCalled()
        })
    })
})

