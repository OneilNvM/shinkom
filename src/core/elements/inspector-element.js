/**@extends {HTMLElement} */
export class CompatInspectorElement extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })

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
                z-index: 9998;
                transition-property: width, height, transform;
                transition-duration: 300ms;
                transition-timing-function: ease-out;
                will-change: width, height, transform;
                pointer-events: none;
            }
        `

        this.shadowRoot?.appendChild(this.styles)
        this.shadowRoot?.appendChild(this.shadowHost)
        console.log("Custom element added to page.");
    }

    disconnectedCallback() {
        console.log("Custom element removed from page.");
    }

    connectedMoveCallback() {
        console.log("Custom element moved with moveBefore()");
    }

    adoptedCallback() {
        console.log("Custom element moved to new page.");
    }
}