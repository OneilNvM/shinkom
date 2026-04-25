// @vitest-environment node

import { afterEach, beforeEach, describe, expect, it, test, vi } from "vitest";
import { SKEngine } from "../../src";

const skEngine = new SKEngine()

describe("Power the Shinkore WASM engine", () => {
    afterEach(() => {
        skEngine.destroy()
    })

    test("should initiate WASM in Node.js environment", async () => {
        await skEngine.initEngine()

        expect(skEngine.compatEngine).not.toBeNull()
    })
})

describe("Analyze compatibility of HTML elements and attributes", () => {
    beforeEach(async () => {
        await skEngine.initEngine()
    })

    afterEach(() => {
        skEngine.destroy()
    })

    it("should return a score of 100 for <header> tag", () => {
        const mockHTML = `<header></header>`

        const result = skEngine.checkElement(mockHTML)

        expect(result).not.toBeNull()

        expect(result?.overall_score).toBe(100)
    })

    it("should return a score of 50 for div tag and align attribute", () => {
        const mockHTML = `<div align="center"></div>`

        const result = skEngine.checkElement(mockHTML)

        expect(result).not.toBeNull()

        expect(result?.overall_score).toBe(50)
    })

    it("should return a score of 100 for div tag and data-level attribute", () => {
        const mockHTML = `<div data-level=20></div>`

        const result = skEngine.checkElement(mockHTML)

        expect(result).not.toBeNull()

        expect(result?.overall_score).toBe(100)
    })

    it("should call console.dir 3 times when checking elements three times", () => {
        const dirSpy = vi.spyOn(console, 'dir')
        const mockHTML = `
        <main class="flex flex-col gap-32">
            <section id="section-1">
                <h2>Section 1 Header</h2>
                <div>
                    <button id="div-button-1">Inner div button</button>
                    <p><span>First span</span> <span>Second span</span></p>
                </div>
            </section>
            <section id="section-2">
                <h2>Section 2 Header</h2>
                <ul>
                    <li>List item 1</li>
                    <li>List item 2</li>
                    <li>List item 3</li>
                </ul>
            </section>
            <section id="section-3">
                <h2>Section 3 Header</h2>
                <form action="/">
                    <div>
                        <label htmlFor="username">Username</label>
                        <input id="username" type="text" placeholder="Username"/>
                    </div>
                    <div>
                        <label htmlFor="password">Password</label>
                        <input id="password" type="password" placeholder="Password"/>
                    </div>

                    <button>Submit</button>
                </form>
            </section>
            <script defer>
                const divButton1 = document.getElementById('div-button-1')

                divButton1.addEventListener('click', () => {
                    console.log("Hey! You clicked me!")    
                })
            </script>
        </main>
        `

        skEngine.checkElements(mockHTML, 1)
        skEngine.checkElements(mockHTML, 2)
        skEngine.checkElements(mockHTML, 3)

        expect(dirSpy).toBeCalledTimes(3)
    })
})