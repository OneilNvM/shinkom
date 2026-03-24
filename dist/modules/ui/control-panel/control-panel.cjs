Object.defineProperty(exports,Symbol.toStringTag,{value:`Module`});var e=class{#e=null;constructor(e){this.bus=e,this.shadowHost=null,this.shadowRoot=null,this.depthLevelInput=null,this.depthLevel=0,this.multiElements=!1}#t(){if(this.shadowHost)Object.assign(this.shadowHost.style,{position:`fixed`,top:`2rem`,left:`2rem`,zIndex:`9999`});else throw Error(`Shadow host is undefined or null.`)}createPanel(){if(this.shadowHost){console.warn(`Shadow host already exists.`);return}this.shadowHost=document.createElement(`div`),this.shadowHost.id=`sk-shadow-host`;try{this.#t()}catch(e){throw this.shadowHost=null,e}document.body.appendChild(this.shadowHost),this.shadowRoot=this.shadowHost.attachShadow({mode:`open`}),this.shadowRoot.innerHTML=`
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
                    <button class="sk-button-style">Inspect</button>
                </div>
                <hr class="sk-hr-line">
                <div class="sk-options-container">
                    <div class="sk-options-header">
                        <p>Inspector Options</p>
                        <p>Inspector Status: Active</p>
                    </div>
                    <div class="sk-options">
                        <div class="sk-options-grid">
                            <p>Inspect multiple elements</p>
                            <input id="sk-toggle-elements" class="sk-options-checkbox" type="checkbox">
                            <input id="sk-depth-level" class="sk-options-input" type="text" placeholder="depth_level" disabled>
                        </div>
                        <div class="sk-options-grid">
                            <p>Toggle Switching</p>
                            <input id="sk-toggle-switching" class="sk-button-style" type="button" value="Enabled">
                        </div>
                        <div class="sk-options-grid">
                            <p>Toggle Inspector</p>
                            <input id="sk-toggle-inspector" class="sk-button-style" type="button" value="Active">
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
        `}setup(){try{this.createPanel()}catch(e){throw e}this.#e=new AbortController;let{signal:e}=this.#e,t=this.shadowRoot?.getElementById(`sk-toggle-inspector`),n=this.shadowRoot?.getElementById(`sk-toggle-switching`),r=this.shadowRoot?.getElementById(`sk-create-inspector`),i=this.shadowRoot?.getElementById(`sk-reset-inspector`),a=this.shadowRoot?.getElementById(`sk-destroy-inspector`),o=this.shadowRoot?.getElementById(`sk-show-panel`),s=this.shadowRoot?.getElementById(`sk-close-panel`),c=this.shadowRoot?.getElementById(`sk-toggle-elements`),l=this.shadowRoot?.getElementById(`sk-depth-level`);t?.addEventListener(`click`,this.#n,{signal:e}),n?.addEventListener(`click`,this.#n,{signal:e}),r?.addEventListener(`click`,this.#n,{signal:e}),i?.addEventListener(`click`,this.#n,{signal:e}),a?.addEventListener(`click`,this.#n,{signal:e}),o?.addEventListener(`click`,this.#r,{signal:e}),s?.addEventListener(`click`,this.#i,{signal:e}),c.addEventListener(`click`,this.#a,{signal:e}),l.addEventListener(`change`,this.#o,{signal:e}),this.depthLevelInput=l}destroy(){try{if(!this.shadowHost)return;this.#e&&this.#e.abort(),this.#e=null,this.shadowHost.remove(),this.shadowRoot=null,this.shadowHost=null,this.depthLevelInput=null,this.depthLevel=0,this.multiElements=!1}catch(e){console.error(`Control panel destroy error: ${e}`)}}#n=e=>{switch(e.target.id){case`sk-toggle-inspector`:this.bus.dispatchEvent(new CustomEvent(`ci:toggle`));break;case`sk-toggle-switching`:this.bus.dispatchEvent(new CustomEvent(`ci:switch`));break;case`sk-create-inspector`:this.bus.dispatchEvent(new CustomEvent(`ci:create`));break;case`sk-reset-inspector`:this.bus.dispatchEvent(new CustomEvent(`ci:reset`));break;case`sk-destroy-inspector`:this.bus.dispatchEvent(new CustomEvent(`ci:destroy`));break;default:console.error(`Could not dispatch an event for element of unknown id: ${id}`);break}};#r=()=>{if(!this.shadowRoot)return;let e=this.shadowRoot.getElementById(`sk-control-panel`);e&&(e.style.display=`flex`)};#i=()=>{if(!this.shadowRoot)return;let e=this.shadowRoot.getElementById(`sk-control-panel`);e&&(e.style.display=`none`)};#a=()=>{this.multiElements=!this.multiElements,this.multiElements?this.depthLevelInput.disabled=!1:this.depthLevelInput.disabled=!0};#o=e=>{this.depthLevel=parseInt(e.target.value,10)}};exports.CompatControlPanel=e;