import { afterEach, beforeEach, describe, expect, it, test, vi } from "vitest";
import { CompatControlPanel, CompatInspector, CompatUI, ShinkomBus, ShinkomState } from "../../src";

const state = new ShinkomState()
const bus = new ShinkomBus()
const controlPanel = new CompatControlPanel(bus, state)
const inspector = new CompatInspector(bus, state)
const compatUI = new CompatUI(bus, state, [
    controlPanel,
    inspector
])

describe("Change the display of the control panel", () => {
    beforeEach(() => {
        compatUI.init()
    })

    afterEach(() => {
        compatUI.destroy()
        document.body.innerHTML = ""
    })

    it("should open the control panel", () => {
        const showButton = controlPanel.controlPanelEl.shadowRootRef.getElementById('sk-show-panel')

        showButton.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        const shadowHost = controlPanel.controlPanelEl.shadowRootRef.getElementById('sk-control-panel')

        expect(shadowHost.style.display).toBe('flex')
    })

    it("should close the control panel", () => {
        const showButton = controlPanel.controlPanelEl.shadowRootRef.getElementById('sk-show-panel')

        showButton.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        const closeButton = controlPanel.controlPanelEl.shadowRootRef.getElementById('sk-close-panel')

        closeButton.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        const shadowHost = controlPanel.controlPanelEl.shadowRootRef.getElementById('sk-control-panel')

        expect(shadowHost.style.display).toBe('none')
    })
})

describe("Control panel 'inspector' options", () => {
    describe("Enable multi-element checking mode", () => {
        beforeEach(() => {
            compatUI.init()
        })

        afterEach(() => {
            compatUI.destroy()

            document.body.innerHTML = ''
        })


        it("should set multiElements to true", () => {
            const toggle = controlPanel.controlPanelEl.shadowRootRef.getElementById('sk-toggle-elements')

            toggle.dispatchEvent(new PointerEvent('click', {
                bubbles: true,
                cancelable: true,
                pointerType: 'mouse'
            }))

            expect(state.getState().multiElements).toBe(true)
        })

        it("should set depthLevel to 3", () => {
            const toggle = controlPanel.controlPanelEl.shadowRootRef.getElementById('sk-toggle-elements')
            const input = /**@type {HTMLInputElement}*/(controlPanel.controlPanelEl.shadowRootRef.getElementById('sk-depth-level'))

            toggle.dispatchEvent(new PointerEvent('click', {
                bubbles: true,
                cancelable: true,
                pointerType: 'mouse'
            }))

            input.value = 3

            input.dispatchEvent(new Event('input', {
                bubbles: true,
                cancelable: true
            }))

            input.dispatchEvent(new Event('change', {
                bubbles: true
            }))

            expect(state.getState().depthLevel).toBe(3)
        })
    })

    describe("Enable element switching mode", () => {
        beforeEach(() => {
            compatUI.init()
        })

        afterEach(() => {
            compatUI.destroy()

            document.body.innerHTML = ''
        })

        test('should enable element switching mode', () => {
            const toggle = controlPanel.controlPanelEl.shadowRootRef.getElementById('sk-toggle-switching')

            toggle.dispatchEvent(new PointerEvent('click', {
                bubbles: true,
                cancelable: true,
                pointerType: 'mouse'
            }))

            expect(state.getState().inspectorSwitching).toBe(true)
        })
    })

    describe("Toggle inspector global listeners", () => {
        beforeEach(() => {
            compatUI.init()
        })

        afterEach(() => {
            compatUI.destroy()

            document.body.innerHTML = ''
        })

        it("should deactivate the inspector", () => {
            const toggle = controlPanel.controlPanelEl.shadowRootRef.getElementById('sk-toggle-inspector')

            toggle.dispatchEvent(new PointerEvent('click', {
                bubbles: true,
                cancelable: true,
                pointerType: 'mouse',
                composed: true
            }))

            expect(state.getState().inspectorActive).toBe(false)
        })

        it("should deactivate and then activate the inspector", () => {
            const toggle = controlPanel.controlPanelEl.shadowRootRef.getElementById('sk-toggle-inspector')

            toggle.dispatchEvent(new PointerEvent('click', {
                bubbles: true,
                cancelable: true,
                pointerType: 'mouse'
            }))

            toggle.dispatchEvent(new PointerEvent('click', {
                bubbles: true,
                cancelable: true,
                pointerType: 'mouse'
            }))

            expect(state.getState().inspectorActive).toBe(true)
        })
    })

    describe("Controlling inspector state", () => {
        const warnSpy = vi.spyOn(console, 'warn')

        beforeEach(() => {
            compatUI.init()
        })

        afterEach(() => {
            compatUI.destroy()

            warnSpy.mockClear()

            document.body.innerHTML = ''
        })

        it("should not create the inspector", () => {
            const button = controlPanel.controlPanelEl.shadowRootRef.getElementById('sk-create-inspector')

            button.dispatchEvent(new PointerEvent('click', {
                bubbles: true,
                cancelable: true,
                pointerType: 'mouse'
            }))

            expect(warnSpy).toBeCalledTimes(1)
        })

        it("should create the inspector", () => {
            const create = controlPanel.controlPanelEl.shadowRootRef.getElementById('sk-create-inspector')

            inspector.unmountSoft()

            create.dispatchEvent(new PointerEvent('click', {
                bubbles: true,
                cancelable: true,
                pointerType: 'mouse'
            }))

            expect(state.getState().inspectorExists).toBe(true)
        })

        it("should not destroy the inspector", () => {
            const destroy = controlPanel.controlPanelEl.shadowRootRef.getElementById('sk-destroy-inspector')

            inspector.unmountSoft()

            destroy.dispatchEvent(new PointerEvent('click', {
                bubbles: true,
                cancelable: true,
                pointerType: 'mouse'
            }))

            expect(warnSpy).toBeCalledTimes(1)
        })

        it("should destroy the inspector", () => {
            const destroy = controlPanel.controlPanelEl.shadowRootRef.getElementById('sk-destroy-inspector')

            destroy.dispatchEvent(new PointerEvent('click', {
                bubbles: true,
                cancelable: true,
                pointerType: 'mouse'
            }))

            expect(state.getState().inspectorExists).toBe(false)
        })

        it("should not reset the inspector", () => {
            const reset = controlPanel.controlPanelEl.shadowRootRef.getElementById('sk-reset-inspector')

            inspector.unmountSoft()

            reset.dispatchEvent(new PointerEvent('click', {
                bubbles: true,
                cancelable: true,
                pointerType: 'mouse'
            }))

            expect(warnSpy).toBeCalledTimes(1)
        })

        it("should reset the inspector", () => {
            const reset = controlPanel.controlPanelEl.shadowRootRef.getElementById('sk-reset-inspector')

            reset.dispatchEvent(new PointerEvent('click', {
                bubbles: true,
                cancelable: true,
                pointerType: 'mouse'
            }))

            expect(state.getState().inspectorExists).toBe(true)
        })
    })
})

describe("Control panel tab switching", () => {
    beforeEach(() => {
        compatUI.init()
    })

    afterEach(() => {
        compatUI.destroy()
        document.body.innerHTML = ''
    })

    it("should be on the inspector tab by default", () => {
        expect(controlPanel.currentTab).toBe("inspector")
    })

    it("should display the Compatibility View tab", () => {
        const compatViewTab = controlPanel.controlPanelEl.shadowRootRef.getElementById('sk-compat-view-tab')

        compatViewTab.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        expect(controlPanel.currentTab).toBe("compatView")
    })

    it("should display the Inspector tab", () => {
        const inspectorTab = controlPanel.controlPanelEl.shadowRootRef.getElementById('sk-inspector-tab')
        const compatViewTab = controlPanel.controlPanelEl.shadowRootRef.getElementById('sk-compat-view-tab')

        compatViewTab.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        inspectorTab.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        expect(controlPanel.currentTab).toBe("inspector")
    })
})

describe("Control panel 'Compatibility View' options", () => {
    beforeEach(() => {
        compatUI.init()

        const compatViewTab = controlPanel.controlPanelEl.shadowRootRef.getElementById('sk-compat-view-tab')

        compatViewTab.click()
    })

    afterEach(() => {
        compatUI.destroy()
        document.body.innerHTML = ''
    })

    it("should change maximum size of results history to 20", () => {
        const maxHistoryInput = controlPanel.controlPanelEl.shadowRootRef.getElementById('sk-max-history')

        expect(maxHistoryInput).not.toBeNull()

        maxHistoryInput.value = 20

        maxHistoryInput.dispatchEvent(new Event('input', {
            bubbles: true,
            cancelable: true
        }))

        maxHistoryInput.dispatchEvent(new Event('change', {
            bubbles: true
        }))

        expect(state.getState().maxResultsHistory).toBe(20)
    })
})
