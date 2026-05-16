/**
 * A custom element for the `CompatInspector` UI component.
 * 
 * An autonomous custom element created via the [Web Components API](https://developer.mozilla.org/en-US/docs/Web/API/Web_components).
 * This component is used for defining and initializing the styling and structure of the `CompatInspector`.
 * 
 * Since this element is defined via the Web Components API, to use this element outside of the `CompatInspector`, it must be registered
 * as a custom element on the `window` object.
 * @extends {HTMLElement}
 */
export class CompatInspectorElement extends HTMLElement {
    constructor() {
        super()

        /**@type {ShadowRoot} */
        this.shadowRootRef = this.attachShadow({ mode: 'open' })

        this.shadowHost = document.createElement('div')
        this.styles = document.createElement('style')
        this.shadowHost.id = 'sk-compat-inspector'
    }

    connectedCallback() {
        this.styles.textContent = `
            #sk-compat-inspector {
                position: absolute;
                top: 0;
                background-color: rgba(0, 255, 0, .3);
                outline-width: 1px;
                outline-style: dashed;
                outline-color: rgb(0, 255, 0);
                outline-offset: 4px;
                z-index: 990;
                transition-property: width, height, transform;
                transition-duration: 300ms;
                transition-timing-function: ease-out;
                will-change: width, height, transform;
                pointer-events: none;
            }
        `

        try {
            this.shadowRootRef.replaceChildren(...[this.styles, this.shadowHost])
        } catch (error) {
            console.error(error)
        }
    }
}