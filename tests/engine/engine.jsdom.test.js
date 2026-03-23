// @vitest-environment jsdom

import { afterEach, describe, expect, it, test, beforeEach, vi } from "vitest";
import { Shinkom } from "../../src";

const shinkom = new Shinkom()

describe("Power the Shinkore WASM engine", () => {
    afterEach(() => {
        shinkom.engine.destroy()
    })

    test("should set the CompatEngine in Browser environment", async () => {
        await shinkom.engine.initEngine()

        expect(shinkom.engine.engine).not.toBeNull()
    })
})

describe("Analyze compatibility of HTML elements and attributes", () => {
    beforeEach(async () => {
        await shinkom.init()
    })

    afterEach(() => {
        shinkom.destroy()
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
        shinkom.compatUI.controlPanel.multiElements = true
        shinkom.compatUI.controlPanel.depthLevel = 1

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

        main.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        expect(dirSpy).toHaveBeenCalled()
    })

    it("should console.dir all elements and their attributes", () => {
        const dirSpy = vi.spyOn(console, 'dir')
        shinkom.compatUI.controlPanel.multiElements = true
        shinkom.compatUI.controlPanel.depthLevel = 2

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

        main.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        expect(dirSpy).toHaveBeenCalled()
    })
})

