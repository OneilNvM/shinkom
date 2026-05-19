/**@typedef {import('../../src/types/public').InspectorConfig} InspectorConfig */
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { CompatInspector } from '../../src'
import { ShinkomBus, ShinkomState } from "../../src/core";

describe('Compatibility Inspector Logic', () => {
    const inspector = new CompatInspector(new ShinkomBus(), new ShinkomState())

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

        inspector.mount()
    })

    afterEach(async () => {
        inspector.unmount()

        document.body.innerHTML = ''
    })

    test('should freeze inspector on target', () => {
        target?.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        expect(inspector.inspectorEl.shadowHost.style.outlineColor).toBe('rgb(255, 0, 0)')
    })

    test('should switch inspector to span element and unfreeze when clicking same target', () => {
        inspector.enableSwitching = true

        target?.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))
        expect(inspector.inspectorEl.shadowHost.style.outlineColor).toBe('rgb(255, 0, 0)')

        const span = target?.querySelector('#nested-span')
        span?.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        expect(inspector.inspectorEl.shadowHost.style.outlineColor).toBe('rgb(255, 0, 0)')

        span?.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))
        expect(inspector.inspectorEl.shadowHost.style.outlineColor).not.toBe('rgb(255, 0, 0)')
    })
})

describe('Compatibility Inspector Keyboard Shortcuts', () => {
    const inspector = new CompatInspector(new ShinkomBus(), new ShinkomState(), { disabled: false, keyboardShortcuts: true })

    /**@type {HTMLElement | null} */
    let target;

    beforeEach(() => {
        document.body.innerHTML = `
        <div id='div-elem' class="div-elem">
            <span id='nested-span'>Nested span element</span>
        </div>
        <span class="span-elem">Item 1</span>
        `;

        target = document.getElementById('nested-span')

        inspector.mount()
    })

    afterEach(() => {
        inspector.unmount()

        document.body.innerHTML = ''
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

    test('should reset the inspector to default configuration', async () => {
        const resetSpy = vi.spyOn(CompatInspector.prototype, 'reset')
        target?.dispatchEvent(new PointerEvent('click', {
            bubbles: true,
            cancelable: true,
            pointerType: 'mouse'
        }))

        window.dispatchEvent(new KeyboardEvent('keydown', {
            key: '|',
            ctrlKey: true,
            shiftKey: true
        }))

        expect(resetSpy).toHaveBeenCalled()
    })
})