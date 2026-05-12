export const controlPanelHTML = `
<div style="position: relative">
    <button id="sk-show-panel" class="sk-button-style sk-show-panel">
        <svg style="display: block; pointer-events: none;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
            class="lucide lucide-panel-left-open-icon lucide-panel-left-open">
            <rect width="18" height="18" x="3" y="3" rx="2" />
            <path d="M9 3v18" />
            <path d="m14 9 3 3-3 3" />
        </svg>
    </button>
    <div part="control-panel" id="sk-control-panel" class="sk-control-panel" style="display: none;">
        <div class="sk-control-panel-inner">
            <nav class="sk-tabs-nav">
                <button id="sk-inspector-tab" class="sk-tab-button">Inspector</button>
                <div class="sk-tab-line"></div>
                <button id="sk-compat-view-tab" class="sk-tab-button">Compatibility View</button>
            </nav>
            <hr class="sk-hr-line">
            <main id="sk-control-panel-main" class="sk-control-panel-main"></main>
            <hr class="sk-hr-line">
            <footer class="sk-close">
                <button id="sk-close-panel" class="sk-button-style">Close</button>
                <span class="sk-copy">&copy; 2026 Shinkom</span>
            </footer>
        </div>
    </div>
</div>
`

export const controlPanelInspectorTab = `
<div class="sk-multi-elements">
    <p>Activate multi-element checking</p>
    <label class="sk-multi-elements-checkbox-container">
        <input id="sk-toggle-elements" type="checkbox">
        <span class="sk-multi-elements-checkbox"></span>
    </label>
    <p>Enter a depth level</p>
    <input id="sk-depth-level" class="sk-text-input" type="text" placeholder="depth_level">
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
`

export const controlPanelCompatViewTab = `
<div class="sk-max-history-container sk-section-grid">
    <p>Change maximum number of results stored in history</p>
    <input id="sk-max-history" class="sk-text-input" type="text" placeholder="default is 10">
</div>
<hr class="sk-hr-line">
<div class="sk-clear-history-container sk-section-grid">
    <p>Clear results history in localStorage</p>
    <button id="sk-clear-history" class="sk-button-style">Clear</button>
</div>
`

export const controlPanelStyleSheet = new CSSStyleSheet()
controlPanelStyleSheet.replaceSync(`
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
        height: 40rem;
        padding-block: 1rem;
        background-image: linear-gradient(to bottom,  var(--sk-primary) 0%, var(--sk-background-variant-1) 25% );
        color: white;
        font-family: Arial, Helvetica, sans-serif;
        border-radius: 1rem;
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
    .sk-control-panel-inner {
        display: flex;
        flex-direction: column;
        height: 100%;
    }
    .sk-tabs-nav {
        position: relative;
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto;
        align-items: center;
        height: 2.5rem;
        margin-bottom: 3rem;
    }
    .sk-tab-button {
        color: white;
        background: none;
        border: none;
        cursor: pointer;
        font-size: var(--sk-text-xl);
    }
    .sk-tab-line {
        position: absolute;
        left: 50%;
        top: 0;
        height: 100%;
        border-left: 1px solid var(--sk-accent);
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
    .sk-control-panel-main {
        font-size: var(--sk-text-lg);
    }
    .sk-multi-elements {
        display: grid;
        grid-template-columns: 1fr 1fr;
        grid-template-rows: auto;
        align-items: center;
        padding-inline: 1rem;
        padding-block: 1.5rem;
        gap: 1.1rem;
    }
    .sk-text-input {
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
        font-size: var(--sk-text-sm);
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
    }
    #sk-create-inspector {
        justify-self: center;
    }
    .sk-reset-inspector-container {
        gap: 1.1rem;
    }
    #sk-reset-inspector {
        justify-self: center;
    }
    .sk-destroy-inspector-container {
        gap: 1.1rem;
    }
    #sk-destroy-inspector {
        justify-self: center;
    }
    .sk-close {
        display: flex;
        flex: 1 1 0%;
        justify-content: space-between;
        align-items: flex-end;
        padding-inline: 1rem;
        padding-top: 1.25rem;
    }
    .sk-copy {
        color: var(--sk-text-grey);
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
    .sk-max-history-container {
        gap: 1.1rem;
    }
    .sk-clear-history-container {
        gap: 1.1rem;
    }
    #sk-clear-history {
        justify-self: center;
    }`
)

export const controlPanelTransitions = new CSSStyleSheet()
controlPanelTransitions.replaceSync(`
    /* Control panel transition styles injected from Shinkom */

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
`)