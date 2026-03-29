Object.defineProperty(exports,Symbol.toStringTag,{value:`Module`});const e=require(`../../core/ui-component.cjs`);var t=class extends e.UIComponent{#e=null;#t=null;constructor(e,t){super(e,t),this.shadowHost=null,this.shadowRoot=null,this.depthLevelInput=null,this.ciStatusEl=null,this.toggleSwitchingEl=null,this.toggleInspectorEl=null,this.depthLevel=0,this.multiElements=!1,t.subscribe((e,t)=>{this.onStateChange(e,t)})}#n(){if(this.shadowHost)Object.assign(this.shadowHost.style,{position:`fixed`,top:`2rem`,left:`2rem`,zIndex:`9999`});else throw Error(`Shadow host is undefined or null.`)}createPanel(){if(this.shadowHost){console.warn(`Shadow host already exists.`);return}this.shadowHost=document.createElement(`div`),this.shadowHost.id=`sk-shadow-host`;try{this.#n()}catch(e){throw this.shadowHost=null,e}document.body.appendChild(this.shadowHost),this.shadowRoot=this.shadowHost.attachShadow({mode:`open`}),this.shadowRoot.innerHTML=`
        <style>
            .sk-control-panel {
                display: flex;
                flex-direction: column;
                justify-content: space-evenly;
                width: 30rem;
                height: 85lvh;
                padding: 1rem;
                background-color: #0f0c13;
                color: white;
                font-family: Arial, Helvetica, sans-serif;
                border-radius: 2rem;
                z-index: 2;
            }

            .sk-control-panel * {
                transition-property: color, background-color, border-color;
                transition-duration: 300ms;
                transition-timing-function: ease-in-out;
            }

            .sk-page-buttons {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                gap: .75rem;
                flex: 1 1 0%;
            }

            .sk-button-style {
                font-size: 1.225rem;
                color: white;
                background-color: #201a27;
                border: 1px solid #3c00c7;
                border-radius: .5rem;
                padding-inline: .5rem;
                padding-block: .3rem;
                cursor: pointer;
            }

            .sk-hr-line {
                width: 100%;
                border: 0px solid transparent;
                border-top: 1px solid #8132ff;
            }

            .sk-full-page-inspect {
                display: flex;
                align-items: center;
                justify-content: space-evenly;
                font-size: 1.8rem;
                flex: 0.5 1 0%;
            }

            .sk-options-container {
                display: flex;
                flex-direction: column;
                gap: .5rem;
                padding-top: 1rem;
                padding-inline: 1rem;
                flex: 5 1 0%;
                font-size: 1.25rem;
            }

            .sk-options-header {
                display: flex;
                align-items: center;
                justify-content: space-between;
                font-size: 1.5rem;
            }

            .sk-options-header p:last-child {
                font-size: 1rem;
            }

            .sk-options {
                display: flex;
                flex-direction: column;
                justify-content: space-evenly;
                height: 100%;
                padding-left: .05rem;
            }

            .sk-options-grid {
                display: grid;
                grid-template-columns: auto auto auto;
                grid-template-rows: auto;
                justify-items: flex-start;
                align-items: center;
            }

            .sk-options-grid:first-child {
                column-gap: .5rem;
            }

            .sk-options-grid .sk-button-style {
                justify-self: flex-end;
            }

            .sk-options-grid .sk-options-input {
                justify-self: flex-end;
            }

            .sk-options-grid .sk-options-input:disabled {
                opacity: .5;
            }

            .sk-options-grid:nth-last-of-type(2), .sk-options-grid:nth-last-of-type(1) {
                grid-template-columns: auto auto;
            }

            .sk-options-input {
                width: 70%;
                padding-block: .2rem;
                padding-inline: .3rem;
                border-radius: .25rem;
                border: none;
                background-color: #232333;
                font-size: 1rem;
                color: white;
            }
            .sk-close {
                display: flex;
                flex-direction: column;
                justify-content: center;
                flex: 1 1 0%;
            }
            .sk-show-panel {
                width: 8rem;
                position: absolute; 
                top: 1rem; 
                left: 1rem;
                z-index: -1;
            }
        </style>
        <div style="position: relative">
            <button id="sk-show-panel" class="sk-button-style sk-show-panel">Show Panel</button>
            <div id="sk-control-panel" class="sk-control-panel" style="display: none;">
                <div class="sk-page-buttons">
                    <button class="sk-button-style">Inspector</button>
                    <button class="sk-button-style">Compatibility View</button>
                </div>
                <hr class="sk-hr-line">
                <div class="sk-full-page-inspect">
                    <p>Inspect Full Page</p>
                    <button id="sk-full-inspect" class="sk-button-style">Inspect</button>
                </div>
                <hr class="sk-hr-line">
                <div class="sk-options-container">
                    <div class="sk-options-header">
                        <p>Inspector Options</p>
                        <p id="sk-inspector-status">Inspector Status: Active</p>
                    </div>
                    <div class="sk-options">
                        <div class="sk-options-grid">
                            <p>Inspect multiple elements</p>
                            <input id="sk-toggle-elements" class="sk-options-checkbox" type="checkbox">
                            <input id="sk-depth-level" class="sk-options-input" type="text" placeholder="depth_level" disabled>
                        </div>
                        <div class="sk-options-grid">
                            <p>Toggle Switching</p>
                            <button id="sk-toggle-switching" class="sk-button-style">Disabled</button>
                        </div>
                        <div class="sk-options-grid">
                            <p>Toggle Inspector</p>
                            <button id="sk-toggle-inspector" class="sk-button-style">Active</button>
                        </div>
                        <button id="sk-create-inspector" class="sk-button-style">Create Inspector</button>
                        <button id="sk-reset-inspector" class="sk-button-style">Reset Inspector</button>
                        <button id="sk-destroy-inspector" class="sk-button-style">Destroy Inspector</button>
                    </div>
                </div>
                <hr class="sk-hr-line">
                <div class="sk-close">
                    <button id="sk-close-panel" class="sk-button-style">Close</button>
                </div>
                <hr class="sk-hr-line">
            </div>
        </div>
        `}bindState(e){this.#e||=e,this.#e.ignorePanelEl=this.shadowHost}onStateChange(e,t){switch(e){case`inspectorSwitching`:this.toggleSwitchingEl&&(this.toggleSwitchingEl.innerHTML=t?`Enabled`:`Disabled`);break;case`inspectorActive`:this.toggleInspectorEl&&(this.toggleInspectorEl.innerHTML=t?`Active`:`Deactive`),this.ciStatusEl&&(this.ciStatusEl.innerHTML=t?`Inspector Status: Active`:`Inspector Status: Deactive`);break;default:break}}mount(){try{this.createPanel()}catch(e){throw e}this.#r()}#r(){this.#t=new AbortController;let{signal:e}=this.#t,t=this.shadowRoot?.getElementById(`sk-toggle-inspector`),n=this.shadowRoot?.getElementById(`sk-toggle-switching`),r=this.shadowRoot?.getElementById(`sk-create-inspector`),i=this.shadowRoot?.getElementById(`sk-reset-inspector`),a=this.shadowRoot?.getElementById(`sk-destroy-inspector`),o=this.shadowRoot?.getElementById(`sk-show-panel`),s=this.shadowRoot?.getElementById(`sk-close-panel`),c=this.shadowRoot?.getElementById(`sk-toggle-elements`),l=this.shadowRoot?.getElementById(`sk-depth-level`),u=this.shadowRoot?.getElementById(`sk-full-inspect`),d=this.shadowRoot?.getElementById(`sk-inspector-status`);t?.addEventListener(`click`,this.#a,{signal:e}),n?.addEventListener(`click`,this.#a,{signal:e}),r?.addEventListener(`click`,this.#a,{signal:e}),i?.addEventListener(`click`,this.#a,{signal:e}),a?.addEventListener(`click`,this.#a,{signal:e}),o?.addEventListener(`click`,this.#a,{signal:e}),s?.addEventListener(`click`,this.#a,{signal:e}),c?.addEventListener(`click`,this.#a,{signal:e}),l?.addEventListener(`change`,this.#o,{signal:e}),u?.addEventListener(`click`,this.#a,{signal:e}),l&&(this.depthLevelInput=l),t&&(this.toggleInspectorEl=t),n&&(this.toggleSwitchingEl=n),d&&(this.ciStatusEl=d)}unmount(){try{if(!this.shadowHost)return;this.shadowHost.remove(),this.shadowHost=null,this.#i()}catch(e){console.error(`Control panel destroy error: ${e}`)}}#i(){this.#t&&this.#t.abort(),this.#t=null,this.shadowRoot=null,this.depthLevelInput=null,this.depthLevel=0,this.multiElements=!1,this.#e&&(this.#e.depthLevel=0,this.#e.multiElements=!1,this.#e.ignorePanelEl=null)}#a=e=>{switch(e.target.id){case`sk-show-panel`:{if(!this.shadowRoot)return;let e=this.shadowRoot.getElementById(`sk-control-panel`);e&&(e.style.display=`flex`);break}case`sk-close-panel`:{if(!this.shadowRoot)return;let e=this.shadowRoot.getElementById(`sk-control-panel`);e&&(e.style.display=`none`);break}case`sk-toggle-inspector`:this.bus.emit(`ci:toggle`);break;case`sk-toggle-elements`:this.multiElements=!this.multiElements,this.depthLevelInput&&(this.multiElements?this.depthLevelInput.disabled=!1:this.depthLevelInput.disabled=!0),this.#e&&(this.#e.multiElements=this.multiElements);break;case`sk-toggle-switching`:this.#e&&(this.#e.inspectorSwitching=!this.#e.inspectorSwitching);break;case`sk-create-inspector`:this.bus.emit(`ci:create`);break;case`sk-reset-inspector`:this.bus.emit(`ci:reset`);break;case`sk-destroy-inspector`:this.bus.emit(`ci:destroy`);break;case`sk-full-inspect`:this.bus.emit(`engine:full`);break;default:console.error(`Could not dispatch an event for element of unknown id: ${e.target.id}`);break}};#o=e=>{let t=parseInt(e.target.value,10);this.depthLevel=t,this.#e&&(this.#e.depthLevel=t)}};exports.CompatControlPanel=t;