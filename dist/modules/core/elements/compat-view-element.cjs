Object.defineProperty(exports,Symbol.toStringTag,{value:`Module`});const e=require(`../helpers.cjs`),t=require(`./templates/compat-view.templates.cjs`),n=require(`./templates/root-styles.template.cjs`),r=typeof window<`u`?HTMLElement:class{};let i=null,a=null,o=null;const s=`1.1.0`;var c=class extends r{constructor(){super(),this.shadowRootRef=this.attachShadow({mode:`open`}),this.shadowHost=document.createElement(`div`),this.shadowHost.id=`sk-shadow-host`,this.shadowHost.classList.add(`sk-shadow-host`),this.currentTab=`overview`,this.state=null,this.bus=null,this._results=null,this._resultsHistory=[],i=e.getStyleSheet(i,n.hostStyles),a=e.getStyleSheet(a,t.compatViewStyles),o=e.getStyleSheet(o,t.compatViewTransitions)}get results(){return this._results}set results(e){if(e){this._results=e,this.updateResultsHistory({...e,checkedAt:new Date().toISOString()});try{this.currentTab===`overview`?this.renderRecentResults():this.currentTab===`results`&&this.renderCompatResult()}catch(e){console.error(`CompatView rendering error: ${e}`)}}}get resultsHistory(){return this._resultsHistory}set resultsHistory(e){if(e){this._resultsHistory=e;try{this.currentTab===`history`&&this.renderHistoryResults()}catch(e){console.error(`CompatView rendering error: ${e}`)}}}updateResultsHistory(e){this.state?this.resultsHistory=[e,...this.resultsHistory].slice(0,this.state.getState().maxResultsHistory):this.resultsHistory=[e,...this.resultsHistory].slice(0,10),this.#t()}#e(){let e=localStorage.getItem(`resultsHistory`);try{e&&(this.resultsHistory=JSON.parse(e))}catch(e){console.error(`Failed to parse results history from localStorage: ${e}`)}}#t(){try{localStorage.setItem(`resultsHistory`,JSON.stringify(this.resultsHistory))}catch(e){console.error(`Failed to backup results history to localStorage: ${e}`)}}#n(){if(document.getElementById(`sk-font-doto`))return;let e=document.createElement(`link`);e.id=`sk-font-doto`,e.href=`https://fonts.googleapis.com/css2?family=Doto:wght,ROND@700,100&display=swap`,e.rel=`stylesheet`,document.head.appendChild(e)}async checkVersion(){let e=sessionStorage.getItem(`shinkom-latest-version`);try{if(e)this.#r(s,e);else{let e=await this.#i();e&&sessionStorage.setItem(`shinkom-latest-version`,e)}}catch(e){console.error(`Failed to perform Shinkom version check: ${e}`)}}#r(t,n){let r=this.shadowRootRef.getElementById(`sk-version-indicator`),i=e.versionToParts(t),a=e.versionToParts(n);r&&(a[0]>i[0]?r.style.backgroundImage=`radial-gradient(circle at center, var(--sk-indicator-red) 1px, transparent 0)`:a[1]>i[1]?r.style.backgroundImage=`radial-gradient(circle at center, var(--sk-indicator-yellow) 1px, transparent 0)`:(a[2]||0)>(i[2]||0)?r.style.backgroundImage=`radial-gradient(circle at center, var(--sk-indicator-blue) 1px, transparent 0)`:r.style.backgroundImage=`radial-gradient(circle at center, var(--sk-indicator-green) 1px, transparent 0)`)}async#i(){let e=await fetch(`https://api.github.com/repos/OneilNvM/shinkom/releases/latest`);if(!e.ok)throw Error(`Unable to fetch Shinkom latest release. Network response was not ok.`);let t=await e.json();return this.#r(s,t.tag_name),t.tag_name}connectedCallback(){this.bus?this._unsubEvent=this.bus.on(`clear:history`,()=>{localStorage.removeItem(`resultsHistory`),this.resultsHistory=[],console.log(`Cleared results history!`);try{this.currentTab===`overview`?this.renderRecentResults():this.currentTab===`results`?this.renderCompatResult():this.renderHistoryResults()}catch(e){console.error(`CompatView rendering error: ${e}`)}}):console.warn(`No event bus was provided to the CompatViewElement. This may cause functional problems when emitting events the CompatViewElement listens for. If this was intentional, then ignore this warning.`),this.state?this._unsubState=this.state.subscribe((e,t)=>{e===`compatViewTab`&&(this.currentTab=t)}):console.warn(`No state was provided to the CompatViewElement. This may cause syncing mistakes between it and the CompatView. If this was intentional, then ignore this warning.`),this.#e(),o&&document.adoptedStyleSheets.push(o),this.#n(),i&&(this.shadowRootRef.adoptedStyleSheets=[i]),a&&this.shadowRootRef.adoptedStyleSheets.push(a),this.shadowRootRef.appendChild(this.shadowHost),this.render()}disconnectedCallback(){let e=document.getElementById(`sk-font-doto`);e&&document.head.removeChild(e),this._unsubEvent&&this._unsubEvent(),this._unsubState&&this._unsubState(),document.adoptedStyleSheets=document.adoptedStyleSheets.filter(e=>e!==o)}render(e=void 0){this.shadowHost.innerHTML=t.compatViewHTML,e?this.renderTabContent(e):this.renderTabContent(`overview`)}renderRecentResults(){let e=this.shadowRootRef.getElementById(`sk-recent-results-list`);if(!e)throw Error(`Failed to render recent results. Container with id 'sk-recent-results-list' does not exist.`);if(this.resultsHistory.length===0){e.innerHTML=`<p>NO RECENT RESULTS</p>`;return}let t=this.resultsHistory.slice(0,5).map(e=>{let t=document.createElement(`sk-recent-result-item`);return t.classList.add(`sk-recent-results-item-container`),t.result=e,t.viewResult=e=>{if(document.startViewTransition)this.#a(e);else{let t=this.state?.getState();t&&(t.compatViewTab=`results`),this.renderCompatResult(e)}},t.innerHTML=`
                <div class="sk-recent-results-item">
                        <p>${e.checkedAt}</p>
                        <p>${e.overall_score}</p>
                        <button class="sk-view-result sk-button-style">Details</button>
                </div>
                <hr class="sk-hr-line">
            `,t});e.replaceChildren(...t)}async#a(e){let t=this.state?.getState(),n=this.shadowRootRef.getElementById(`sk-compat-view-main`);if(n){let r=[`overview`,`results`,`history`],i=r.indexOf(`results`)>r.indexOf(this.currentTab)?`forward`:`backward`;n.part.value=`compat-view`,document.documentElement.dataset.transition=i,t&&(t.compatViewTab=`results`);let a=document.startViewTransition(()=>this.renderCompatResult(e));try{await a.finished}finally{n.removeAttribute(`part`),delete document.documentElement.dataset.transition}}}renderTabContent(e){try{switch(e){case`overview`:let e=this.shadowRootRef.getElementById(`sk-compat-view-main`);e&&(e.innerHTML=t.compatViewOverviewHTML,this.checkVersion(),this.renderRecentResults());break;case`results`:this.renderCompatResult();break;case`history`:this.renderHistoryResults();break}}catch(e){console.error(`CompatView rendering error: ${e}`)}}renderHistoryResults(){let e=this.shadowRootRef.getElementById(`sk-compat-view-main`);if(!e)throw Error(`Failed to render history results. Container with id 'sk-compat-view-main' does not exist`);if(this.resultsHistory.length===0){e.innerHTML=`<p>NO PREVIOUS RESULTS</p>`;return}else e.innerHTML=`<div id="sk-history-container" class="sk-history-container"></div>`;let t=this.shadowRootRef.getElementById(`sk-history-container`),n=this.resultsHistory.map(e=>{let t=document.createElement(`sk-history-item`);return t.result=e,t.viewResult=e=>{if(document.startViewTransition)this.#a(e);else{let t=this.state?.getState();t&&(t.compatViewTab=`results`),this.renderCompatResult(e)}},t.innerHTML=`
                <div class="sk-history-item">
                    <p>Score ${e.overall_score}</p>
                    <p>Check performed at: ${e.checkedAt}</p>
                </div>
            `,t});if(t){let e=document.createDocumentFragment();n.forEach(t=>e.appendChild(t)),t.appendChild(e)}else throw Error(`Could not render results history items. Container with id 'sk-history-container' does not exist`)}renderCompatResult(e=void 0){let t=this.shadowRootRef.getElementById(`sk-compat-view-main`),n=e||this.resultsHistory[0];if(!t)throw Error(`Failed to render compat result. Container with id 'sk-compat-view-main' does not exist.`);if(n)t.innerHTML=`
                <div class="sk-compat-result-container doto-regular">
                    <div class="sk-compat-result-header">
                        <div class="sk-compat-header-top">
                            <p>Score ${e?e.overall_score:this.resultsHistory[0].overall_score}</p>
                            <p>Arrived</p>
                        </div>
                        <p>${e?e.checkedAt:this.resultsHistory[0].checkedAt}</p>
                    </div>
                    <div id="sk-compat-results" class="sk-compat-results"></div>
                </div>
            `;else{t.innerHTML=`<p>NO RESULTS ARRIVING</p>`;return}let r=this.shadowRootRef.getElementById(`sk-compat-results`),i=(e||this.resultsHistory[0]).lookup_results.map((e,t)=>{let n=parseInt(e.compat_score,10),r=n>=90?`On time`:n>=60?`Delayed`:`Cancelled`;return`
                <div class="sk-compat-result">
                    <div class="sk-general-result">
                        <div class="sk-general-result-meta">
                            <p>${e.compat_score}</p>
                            <p>${t+1} ${e.name}</p>
                            <p ${r===`Delayed`?`style="color: var(--sk-results-yellow-foreground)"`:r===`Cancelled`?`style="color: var(--sk-results-red-foreground)"`:``}>${r}</p>
                        </div>
                        <div>
                            <p>Calling at: ${e.mdn_url?`<a href="${e.mdn_url}" target="_blank">${e.mdn_url}</a>`:`<span style="color: var(--sk-results-red-foreground)">Missing</span>`}
                            </p>
                            <p>Browser Score: ${e.browser_score}</p>
                            <p>Status Score: ${e.status_score}</p>
                        </div>
                    </div>
                    <details>
                        <summary>Show Browser Results</summary>
                        <div class="sk-browser-results">
                            ${this.renderBrowserResults(e)}
                        </div>
                    </details>
                </div>
            `});if(r)r.innerHTML=i.join(``);else throw Error(`Could not render compat result item. Container with id 'sk-compat-results' does not exist.`)}renderBrowserResults(e){return e.browsers.map(e=>{let t=(Array.isArray(e.versions),e.versions),n=[];return t instanceof Array?t.forEach(e=>{n.push(`
                        <p>Added in version: ${e.version_added}</p>
                        ${e.version_removed?`<p>Removed in version: ${e.version_removed}</p>`:``}
                        ${e.version_last?`<p>Last in version: ${e.version_last}</p>`:``}
                        ${e.partial_implementation?`<p>Partially implemented in version: ${e.partial_implementation}</p>`:``}
                    `)}):n.push(`
                    <p>Added in version: ${t.version_added}</p>
                    ${t.version_removed?`<p>Removed in version: ${t.version_removed}</p>`:``}
                    ${t.version_last?`<p>Last in version: ${t.version_last}</p>`:``}
                    ${t.partial_implementation?`<p>Partially implemented in version: ${t.partial_implementation}</p>`:``}
                `),`
                <div class="sk-browser-result">
                    <div class="sk-browser-result-meta">
                        <p style="color: var(--sk-results-blue-foreground)">${e.browser_name}</p>
                        <p>Safety ${e.score.raw_score}</p>
                        <p>Market ${e.score.weighted_score}</p>
                    </div>
                    <div>
                        ${n.join(``)}
                    </div>
                </div>
            `}).join(``)}renderDisplayTransition(e){let t=this.shadowRootRef.getElementById(`sk-compat-view-container`);t&&(e===`show`?t.style.display=`block`:e===`hide`&&(t.style.display=`none`))}};exports.CompatViewElement=c;