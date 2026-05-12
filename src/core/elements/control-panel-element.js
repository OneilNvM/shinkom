import { controlPanelHTML, controlPanelStyleSheet, controlPanelTransitions } from "./templates/control-panel.templates"
import { hostStyleSheet } from "./templates/root-styles.template"

/**@extends {HTMLElement} */
export class CompatControlPanelElement extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })

        this.shadowHost = document.createElement('div')
        this.shadowHost.id = 'sk-shadow-host'
    }

    connectedCallback() {
        Object.assign(this.shadowHost.style, {
            position: 'fixed',
            top: '2rem',
            left: '2rem',
            zIndex: '992',
        })

        document.adoptedStyleSheets.push(controlPanelTransitions)

        if (this.shadowRoot)
            this.shadowRoot.adoptedStyleSheets = [hostStyleSheet, controlPanelStyleSheet]

        this.shadowRoot?.appendChild(this.shadowHost)

        this.render()
    }

    render() {
        this.shadowHost.innerHTML = controlPanelHTML
    }

    /**
     * @param {"show" | "hide"} display
     */
    renderDisplayTransition(display) {
        const panel = this.shadowRoot?.getElementById('sk-control-panel')
        if (panel) {
            if (display === "show") {
                panel.style.display = "flex"
            } else if (display === "hide") {
                panel.style.display = "none"
            }
        }
    }
}