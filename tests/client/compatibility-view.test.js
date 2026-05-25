/**@typedef {import("../../src/types/public").CompatSnapshot} CompatSnapshot */

import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { CompatInspector, CompatUI, CompatView, ShinkomBus, ShinkomState } from "../../src";
import { SKEngine } from '../../src/engine'

const state = new ShinkomState()
const bus = new ShinkomBus()
const compatView = new CompatView(bus, state)
const compatUI = new CompatUI(bus, state, [
    compatView
])

describe("Change the display of the compatibility view", () => {
    beforeEach(() => {
        compatUI.init()
    })

    afterEach(() => {
        compatUI.destroy()

        document.body.innerHTML = ''
    })

    it("should display the compatibility view", () => {
        const toggle = compatView.compatViewEl.shadowRootRef.getElementById('sk-toggle-compat-view')

        toggle.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        const shadowHost = compatView.compatViewEl.shadowRootRef.getElementById('sk-compat-view-container')

        expect(shadowHost.style.display).toBe('block')
    })

    it("should display and hide the compatibility view", () => {
        const toggle = compatView.compatViewEl.shadowRootRef.getElementById('sk-toggle-compat-view')

        toggle.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        const shadowHost = compatView.compatViewEl.shadowRootRef.getElementById('sk-compat-view-container')

        expect(shadowHost.style.display).toBe('block')

        toggle.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        expect(shadowHost.style.display).toBe('none')
    })
})

describe("Change tabs in the compatibility view", () => {
    beforeEach(() => {
        compatUI.init()
    })

    afterEach(() => {
        compatUI.destroy()

        document.body.innerHTML = ''
    })

    it("should start on the overview tab", () => {
        expect(compatView.currentTab).toBe("overview")
    })

    it("should switch to the results tab", () => {
        const tab = compatView.compatViewEl.shadowRootRef.getElementById('sk-results-tab')

        tab.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        expect(compatView.currentTab).toBe("results")
    })

    it("should switch to the history tab", () => {
        const tab = compatView.compatViewEl.shadowRootRef.getElementById('sk-history-tab')

        tab.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        expect(compatView.currentTab).toBe("history")
    })

    it("should go from the overview tab to results, history, and back to overview", () => {
        const overviewTab = compatView.compatViewEl.shadowRootRef.getElementById('sk-overview-tab')
        const resultsTab = compatView.compatViewEl.shadowRootRef.getElementById('sk-results-tab')
        const historyTab = compatView.compatViewEl.shadowRootRef.getElementById('sk-history-tab')

        expect(compatView.currentTab).toBe("overview")

        resultsTab.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        expect(compatView.currentTab).toBe("results")

        historyTab.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        expect(compatView.currentTab).toBe("history")

        overviewTab.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        expect(compatView.currentTab).toBe("overview")
    })
})

describe("Full page inspect", () => {
    beforeEach(() => {
        compatUI.init()
    })

    afterEach(() => {
        compatUI.destroy()

        document.body.innerHTML = ''
    })

    test('should perform a full page inspect', async () => {
        const engine = new SKEngine(bus)
        await engine.initEngine()

        const inspect = compatView.compatViewEl.shadowRootRef.getElementById('sk-full-inspect')

        inspect.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        const resultsHistory = localStorage.getItem('resultsHistory')

        expect(resultsHistory).not.toBeNull()

        const results = /**@type {CompatSnapshot[]} */ (JSON.parse(resultsHistory))

        expect(results.length).toBe(1)

        engine.destroy()
        localStorage.clear()
    })
})

describe('Viewing previous results', () => {
    const engine = new SKEngine(bus)

    beforeEach(async () => {
        compatUI.init()

        await engine.initEngine()
    })

    afterEach(() => {
        compatUI.destroy()

        document.body.innerHTML = ''

        engine.destroy()
        localStorage.clear()
    })

    it('should perform 2 full page inspects and view the recent result', () => {
        const inspect = compatView.compatViewEl.shadowRootRef.getElementById('sk-full-inspect')

        inspect.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        inspect.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        const recentsList = compatView.compatViewEl.shadowRootRef.getElementById('sk-recent-results-list')

        expect(recentsList.childElementCount).toBe(2)

        const item = recentsList.querySelector('sk-recent-result-item')
        const view = item.querySelector('.sk-view-result')

        view.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        expect(compatView.currentTab).toBe('results')
    })

    it('should perform a 3 full page inspects and view the second result from the history tab', () => {
        const inspect = compatView.compatViewEl.shadowRootRef.getElementById('sk-full-inspect')
        const historyTab = compatView.compatViewEl.shadowRootRef.getElementById('sk-history-tab')

        inspect.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        inspect.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        inspect.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        historyTab.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        expect(compatView.currentTab).toBe('history')

        const historyContainer = compatView.compatViewEl.shadowRootRef.getElementById('sk-history-container')

        expect(historyContainer.childElementCount).toBe(3)

        const item = historyContainer.querySelectorAll('sk-history-item')[1]
        const view = item.querySelector('.sk-history-item')

        view.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        expect(compatView.currentTab).toBe('results')
    })
})