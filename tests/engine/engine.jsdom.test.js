// @vitest-environment jsdom

import { afterEach, describe, expect, it, test, beforeEach, vi } from "vitest";
import { CompatControlPanel, CompatInspector, CompatUI, Shinkom, SKEngine } from "../../src";
import { ShinkomBus, ShinkomState } from "../../src/core";



describe("Power the Shinkore WASM engine", () => {
    const shinkom = new Shinkom()
    afterEach(() => {
        shinkom.skEngine.destroy()
    })

    test("should set the CompatEngine in Browser environment", async () => {
        await shinkom.skEngine.initEngine()

        expect(shinkom.skEngine.compatEngine).not.toBeNull()
    })
})

describe("Analyze compatibility of HTML elements and attributes", () => {
    const shinkomBus = new ShinkomBus()
    const state = new ShinkomState()
    const inspector = new CompatInspector(shinkomBus, state)
    const controlPanel = new CompatControlPanel(shinkomBus, state)
    const skEngine = new SKEngine(shinkomBus)
    const compatUI = new CompatUI(shinkomBus, state, [
        inspector,
        controlPanel
    ])

    beforeEach(async () => {
        await skEngine.initEngine()
        compatUI.init()
    })

    afterEach(() => {
        skEngine.destroy()
        compatUI.destroy()
        document.body.innerHTML = ""
    })

    it("should console.dir <video> tag as not deprecated", () => {
        const dirSpy = vi.spyOn(console, 'dir')

        document.body.innerHTML = `
            <div>
                <video></video>
            </div>
        `

        const videoTag = document.getElementsByTagName('video')[0]

        videoTag.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        expect(dirSpy).toHaveBeenCalled()
    })

    it("should console.dir <big> tag as deprecated", () => {
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

        expect(dirSpy).toHaveBeenCalled()
    })

    it("should console.dir <main> <h1> <p> <div> <button> and all of their attributes", () => {
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
            </div>
        `

        const main = document.getElementById('main-container')

        main?.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        expect(dirSpy).toHaveBeenCalled()
    })

    it("should console.dir all elements and their attributes", () => {
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
            </div>
        `

        const main = document.getElementById('main-container')

        main?.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        expect(dirSpy).toHaveBeenCalled()
    })
})

