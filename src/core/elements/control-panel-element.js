/**@extends {HTMLElement} */
export class CompatControlPanelElement extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })

        this.styles = document.createElement('style')
        this.shadowHost = document.createElement('div')
        this.shadowHost.id = 'sk-shadow-host'
    }

    connectedCallback() {
        Object.assign(this.shadowHost.style, {
            position: 'fixed',
            top: '2rem',
            left: '2rem',
            zIndex: '9999'
        })
        this.styles.textContent = `
            :root {
                --sk-primary: #050021;
                --sk-secondary: #1E0074;
                --sk-accent: #C9D1FF;
                --sk-hover-color: #03001a;
                --sk-background-variant-1: #191B1C;
                --sk-background-variant-2: #1E1E1E;

                --sk-text-grey: #5f5f5f;

                --sk-text-xs: 0.75rem;
                --sk-text-sm: 0.875rem;
                --sk-text-base: 1rem;
                --sk-text-md: 1.075rem;
                --sk-text-lg: 1.125rem;
                --sk-text-xl: 1.25rem;
                --sk-text-2xl: 1.5rem;
            }
            
            * {
                box-sizing: border-box;
                margin: 0;
                padding: 0;
            }

            .sk-control-panel {
                display: flex;
                flex-direction: column;
                justify-content: space-evenly;
                width: 30rem;
                padding-block: 1rem;
                background-image: linear-gradient(to bottom,  var(--sk-primary) 0%, var(--sk-background-variant-1) 25% );
                color: white;
                font-family: Arial, Helvetica, sans-serif;
                border-radius: 1rem;
                z-index: 2;
                overflow: hidden;
            }

            .sk-control-panel * {
                transition-property: color, background-color, border-color;
                transition-duration: 300ms;
                transition-timing-function: ease-in-out;
            }

            .sk-section-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-template-rows: auto;
                align-items: center;
                padding-inline: 1rem;
                padding-block: .5rem;
            }

            .sk-page-buttons {
                position: relative;
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-template-rows: auto;
                align-items: center;
                height: 2.5rem;
                margin-bottom: 3rem;
            }

            .sk-page-button {
                color: white;
                background: none;
                border: none;
                cursor: pointer;
                font-size: var(--sk-text-xl);
            }

            .sk-page-line {
                position: absolute;
                left: 50%;
                top: 0;
                height: 100%;
                border-left: 1px solid var(--sk-accent);
            }

            #sk-full-inspect {
                justify-self: center;
            }

            .sk-button-style {
                width: fit-content;
                font-size: var(--sk-text-md);
                color: white;
                background-color: var(--sk-background-variant-2);
                border: 1px solid var(--sk-secondary);
                border-radius: .5rem;
                padding-inline: 1.1rem;
                padding-block: .3rem;
                cursor: pointer;
            }

            .sk-button-style:hover {
                background-color: var(--sk-hover-color);
            }

            .sk-hr-line {
                width: 100%;
                border: 0px solid transparent;
                border-top: 1px solid var(--sk-accent);
            }

            .sk-full-page-inspect {
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-template-rows: auto;
                align-items: center;
                font-size: var(--sk-text-lg);
                padding-inline: 1rem;
                padding-block: .5rem;
                gap: 1.1rem;
            }

            .sk-multi-elements {
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-template-rows: auto;
                align-items: center;
                font-size: var(--sk-text-lg);
                padding-inline: 1rem;
                padding-block: 1.5rem;
                gap: 1.1rem;
            }

            .sk-depth-level-input {
                width: 50%;
                justify-self: center;
                background-color: var(--sk-background-variant-2);
                border: 1px solid var(--sk-secondary);
                border-radius: .35rem;
                padding: .25rem;
                color: white;
                text-align: center;
                font-size: var(--sk-text-md);
            }

            .sk-multi-elements-checkbox-container {
                width: fit-content;
                height: fit-content;
                justify-self: center;
                padding: .1rem;
            }
            .sk-multi-elements-checkbox-container input {
                position: absolute;
                opacity: 0;
                cursor: pointer;
                height: 0;
                width: 0;
            }

            .sk-multi-elements-checkbox-container:hover input ~ .sk-multi-elements-checkbox {
                background-color: var(--sk-hover-color);
            }

            .sk-multi-elements-checkbox-container input:checked ~ .sk-multi-elements-checkbox::after {
                position: absolute;
                top: 5%;
                left: 25%;
                content: "✔";
                color: white;
                font-size: var(--sk-text-sm)
            }

            .sk-multi-elements-checkbox {
                position: relative;
                display: inline-block;
                width: 1.5rem;
                height: 1.5rem;
                background-color: var(--sk-background-variant-2);
                border: 1px solid var(--sk-secondary);
                border-radius: .35rem;
            }

            .sk-element-switching {
                gap: 1.1rem;
                font-size: var(--sk-text-lg)
            }

            #sk-toggle-switching {
                justify-self: center;
            }

            .sk-inspector-toggling-container {
                padding-inline: 1rem;
                padding-block: .5rem;
            }
            .sk-inspector-toggling {
                display: grid;
                grid-template-columns: 1fr 1fr;
                grid-template-rows: auto;
                align-items: center;
                gap: 1.1rem;
                font-size: var(--sk-text-lg)
            }

            #sk-toggle-inspector {
                justify-self: center;
            }

            .sk-inspector-toggling-hint {
                font-size: var(--sk-text-xs);
                color: var(--sk-text-grey);
            }

            .sk-create-inspector-container {
                gap: 1.1rem;
                font-size: var(--sk-text-lg)
            }

            #sk-create-inspector {
                justify-self: center;
            }

            .sk-reset-inspector-container {
                gap: 1.1rem;
                font-size: var(--sk-text-lg)
            }

            #sk-reset-inspector {
                justify-self: center;
            }

            .sk-destroy-inspector-container {
                gap: 1.1rem;
                font-size: var(--sk-text-lg)
            }

            #sk-destroy-inspector {
                justify-self: center;
            }

            .sk-close {
                display: flex;
                justify-content: space-between;
                align-items: flex-end;
                padding-inline: 1rem;
                padding-top: 1.25rem;
            }

            .sk-copy {
                color: var(--sk-text-grey)
            }

            .sk-show-panel {
                width: fit-content;
                position: absolute; 
                top: 1rem; 
                left: 1rem;
                z-index: -1;
                transition-property: color, background-color, border-color;
                transition-duration: 300ms;
                transition-timing-function: ease-in-out;
            }
        `

        this.shadowRoot?.appendChild(this.styles)
        this.shadowRoot?.appendChild(this.shadowHost)

        this.render()
    }

    render() {
        this.shadowHost.innerHTML = `
        <div style="position: relative">
            <button id="sk-show-panel" class="sk-button-style sk-show-panel">
                <svg style="pointer-events: none;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                    class="lucide lucide-panel-left-open-icon lucide-panel-left-open">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <path d="M9 3v18" />
                    <path d="m14 9 3 3-3 3" />
                </svg>
            </button>
            <div id="sk-control-panel" class="sk-control-panel" style="display: none;">
                <div class="sk-page-buttons">
                    <button class="sk-page-button">Inspector</button>
                    <div class="sk-page-line"></div>
                    <button class="sk-page-button">Compatibility View</button>
                </div>
                <hr class="sk-hr-line">
                <div class="sk-full-page-inspect">
                    <p>Perform a full page inspect</p>
                    <button id="sk-full-inspect" class="sk-button-style">Full Inspect</button>
                </div>
                <hr class="sk-hr-line">
                <div class="sk-multi-elements">
                    <p>Activate multi-element checking</p>
                    <label class="sk-multi-elements-checkbox-container">
                        <input id="sk-toggle-elements" type="checkbox">
                        <span class="sk-multi-elements-checkbox"></span>
                    </label>
                    <p>Enter a depth level</p>
                    <input id="sk-depth-level" class="sk-depth-level-input" type="text" placeholder="depth_level">
                </div>
                <hr class="sk-hr-line">
                <div class="sk-element-switching sk-section-grid">
                    <p>Toggle element switching</p>
                    <button id="sk-toggle-switching" class="sk-button-style">Disabled</button>
                </div>
                <hr class="sk-hr-line">
                <div class="sk-inspector-toggling-container">
                    <div class="sk-inspector-toggling">
                        <p>Toggle the inspector</p>
                        <button id="sk-toggle-inspector" class="sk-button-style">Enabled</button>
                    </div>
                    <span class="sk-inspector-toggling-hint">Sets/ removes event listeners for the inspector, setting/
                        removing the override of click and
                        pointer events on the window object.</span>
                </div>
                <hr class="sk-hr-line">
                <div class="sk-create-inspector-container sk-section-grid">
                    <p>Create inspector</p>
                    <button id="sk-create-inspector" class="sk-button-style">Create</button>
                </div>
                <hr class="sk-hr-line">
                <div class="sk-reset-inspector-container sk-section-grid">
                    <p>Reset inspector</p>
                    <button id="sk-reset-inspector" class="sk-button-style">Reset</button>
                </div>
                <hr class="sk-hr-line">
                <div class="sk-destroy-inspector-container sk-section-grid">
                    <p>Destroy inspector</p>
                    <button id="sk-destroy-inspector" class="sk-button-style">Destroy</button>
                </div>
                <hr class="sk-hr-line">
                <div class="sk-close">
                    <button id="sk-close-panel" class="sk-button-style">Close</button>
                    <span class="sk-copy">&copy; 2026 Shinkom</span>
                </div>
            </div>
        </div>
        `
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