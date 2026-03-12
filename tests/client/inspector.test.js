/**@typedef {import('../../types/inspector.types').InspectorConfig} InspectorConfig */
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { CompatInspector } from "../../src";

describe('Compatibility Inspector Logic', () => {
    let inspector = new CompatInspector(/**@type {InspectorConfig} */({}), null)

    /**@type {HTMLElement | null} */
    let target;

    beforeEach(() => {
        document.body.innerHTML = `
        <div id='div-elem' class="div-elem">
            <span id='nested-span'>Nested span element</span>
        </div>
        <span class="span-elem">Item 1</span>
        `;

        target = document.getElementById('div-elem')

        inspector.setup()
    })

    afterEach(() => {
        inspector.destroy()
    })

    test('should freeze inspector on target', () => {
        target?.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        expect(inspector.inspectorEl?.style.outlineColor).toBe('rgb(255, 0, 0)')
    })

    test('should switch inspector to span element and unfreeze when clicking same target', () => {
        target?.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))
        expect(inspector.inspectorEl?.style.outlineColor).toBe('rgb(255, 0, 0)')

        const span = target?.querySelector('#nested-span')
        span?.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        expect(inspector.inspectorEl?.style.outlineColor).toBe('rgb(255, 0, 0)')

        span?.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))
        expect(inspector.inspectorEl?.style.outlineColor).not.toBe('rgb(255, 0, 0)')
    })
})

describe('Compatibility Inspector Keyboard Shortcuts', () => {
    let inspector = new CompatInspector(/**@type {InspectorConfig} */({ keyboardShorcuts: true }), null)

    /**@type {HTMLElement | null} */
    let target;

    beforeEach(() => {
        inspector.destroy()

        document.body.innerHTML = `
        <div id='div-elem' class="div-elem">
            <span id='nested-span'>Nested span element</span>
        </div>
        <span class="span-elem">Item 1</span>
        `;

        target = document.getElementById('nested-span')

        inspector.setup()
    })

    afterEach(() => {
        inspector.destroy()
    })

    test('should change switching to true', () => {
        window.dispatchEvent(new KeyboardEvent('keydown', {
            key: '\\',
            ctrlKey: true
        }))

        expect(inspector.enableSwitching).toBe(true)
    })

    test('should remove the inspector and events from the DOM', () => {
        window.dispatchEvent(new KeyboardEvent('keydown', {
            key: '\\',
            ctrlKey: true,
            altKey: true
        }))

        expect(inspector.inspectorEl).toBeNull()
    })

    test('should reset the inspector to default configuration', () => {
        const destroySpy = vi.spyOn(CompatInspector.prototype, 'destroy')
        target?.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        inspector.reset()

        expect(destroySpy).toHaveBeenCalled()

        expect(inspector.inspectorEl?.style.outlineColor).toBe('rgb(0, 255, 0)')
    })
})