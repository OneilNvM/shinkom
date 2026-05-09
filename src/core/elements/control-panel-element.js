import { controlPanelHTML, controlPanelStyleSheet } from "./templates/control-panel.templates"
import { hostStyleSheet } from "./templates/root-styles.template"

/**@extends {HTMLElement} */
export class CompatControlPanelElement extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })

        this.shadowHost = document.createElement('div')
        this.shadowHost.id = 'sk-shadow-host'
    }

    #injectHeadStyles() {
        const style = document.createElement('style')
        style.textContent = `
            /* Control panel styles injected from Shinkom */

            ::part(control-panel) {
                view-transition-name: control-panel;
            }

            @keyframes move-fade-in {
                from {
                    opacity: 0;
                    transform: translateX(-2rem)
                }

                to {
                    opacity: 1;
                    transform: translateX(0rem)
                }
            }

            @keyframes move-fade-out {
                from {
                    opacity: 1;
                    transform: translateX(0rem);
                }

                to {
                    opacity: 0;
                    transform: translateX(-2rem);
                }
            }

            ::view-transition-old(control-panel) {
                animation: 300ms ease-out both move-fade-out;
            }

            ::view-transition-new(control-panel) {
                animation: 300ms ease-out both move-fade-in;
            }
        `

        document.head.appendChild(style)
    }

    connectedCallback() {
        this.#injectHeadStyles()

        Object.assign(this.shadowHost.style, {
            position: 'fixed',
            top: '2rem',
            left: '2rem',
            zIndex: '992',
        })

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
        if (display === "show") {
            if (panel) {
                panel.style.display = "flex"
            }

        } else if (display === "hide") {
            if (panel) {
                panel.style.display = "none"
            }
        }
    }
}