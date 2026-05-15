/**@typedef {import('../../types/public').CompatResult} CompatResult */
/**@typedef {import('../../types/public').CompatSnapshot} CompatSnapshot */
/**@typedef {import('../../types/public').LookupResult} LookupResult */

import pkg from '../../../package.json'
import { ShinkomBus } from '../event-bus'
import { versionToParts } from '../helpers'
import { ShinkomState } from '../state-service'
import { RecentResultItem } from './recent-result-item'
import { ResultsHistoryItem } from './results-history-item'
import { compatViewHTML, compatViewOverviewHTML, compatViewStyleSheet, compatViewTransitions } from './templates/compat-view.templates'
import { hostStyleSheet } from './templates/root-styles.template'

/**
 * A custom element for the `CompatView` UI component.
 * 
 * An autonomous custom element created via the [Web Components API](https://developer.mozilla.org/en-US/docs/Web/API/Web_components).
 * This component contains methods for rendering components for the CompatView and handling how the results from the engine
 * is stored and displayed for viewing.
 * 
 * Since this element is defined via the Web Components API, to use this element outside of the CompatView, it must be registered
 * as a custom element on the `window` object.
 * @extends {HTMLElement} 
*/
export class CompatViewElement extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })

        this.shadowHost = document.createElement('div')
        this.shadowHost.id = "sk-shadow-host"
        this.shadowHost.classList.add('sk-shadow-host')

        this.currentTab = "overview"

        /**@type {ShinkomState | null} */
        this.state = null

        /**@type {ShinkomBus | null} */
        this.bus = null

        /**@type {CompatResult | null} */
        this._results = null

        /**@type {CompatSnapshot[]} */
        this._resultsHistory = []
    }

    get results() {
        return this._results
    }

    set results(val) {
        if (!val) return

        this._results = val;

        this.updateResultsHistory({
            ...val,
            checkedAt: new Date().toISOString()
        })

        if (this.currentTab === "overview") {
            this.renderRecentResults()
        } else if (this.currentTab === "results") {
            this.renderCompatResult()
        }
    }

    get resultHistory() {
        return this._resultsHistory
    }

    /**
     * Updates the results history and backs up the results to `localStorage`
     * @param {CompatSnapshot} val 
     */
    updateResultsHistory(val) {
        if (this.state) {
            this._resultsHistory = [val, ...this._resultsHistory].slice(0, this.state.getState().maxResultsHistory)
        } else {
            this._resultsHistory = [val, ...this._resultsHistory].slice(0, 10)
        }

        this.#backupResultsToLocalStorage()
    }

    #retrieveResultsFromLocalStorage() {
        const resultsHistory = localStorage.getItem("resultsHistory")
        if (resultsHistory) this._resultsHistory = JSON.parse(resultsHistory)
    }

    #backupResultsToLocalStorage = () => localStorage.setItem("resultsHistory", JSON.stringify(this._resultsHistory))

    #injectFontLink() {
        if (document.getElementById('sk-font-doto')) return

        const link = document.createElement('link')

        link.id = "sk-font-doto"
        link.href = "https://fonts.googleapis.com/css2?family=Doto:wght,ROND@700,100&display=swap"
        link.rel = "stylesheet"

        document.head.appendChild(link)
    }

    async checkVersion() {
        const shinkomVersion = sessionStorage.getItem('shinkom-latest-version')
        if (shinkomVersion) {
            this.#processVersions(pkg.version, shinkomVersion)
        } else {
            const version = await this.#checkLatestVersion()
            if (version) sessionStorage.setItem('shinkom-latest-version', version)
        }
    }

    /**
     * @param {string} localV 
     * @param {string} remoteV 
     */
    #processVersions(localV, remoteV) {
        const versionIndicator = this.shadowRoot?.getElementById('sk-version-indicator')
        const local = versionToParts(localV)
        const remote = versionToParts(remoteV)
        if (versionIndicator) {
            if (remote[0] > local[0]) {
                versionIndicator.style.backgroundImage = "radial-gradient(circle at center, var(--sk-indicator-red) 1px, transparent 0)"
            } else if (remote[1] > local[1]) {
                versionIndicator.style.backgroundImage = "radial-gradient(circle at center, var(--sk-indicator-yellow) 1px, transparent 0)"
            } else if ((remote[2] || 0) > (local[2] || 0)) {
                versionIndicator.style.backgroundImage = "radial-gradient(circle at center, var(--sk-indicator-blue) 1px, transparent 0)"
            } else {
                versionIndicator.style.backgroundImage = "radial-gradient(circle at center, var(--sk-indicator-green) 1px, transparent 0)"
            }
        }
    }

    /**
     * 
     * @returns {Promise<string | undefined>} latest version
     */
    async #checkLatestVersion() {
        try {
            const response = await fetch("https://api.github.com/repos/OneilNvM/shinkom/releases/latest")
            if (!response.ok) throw new Error("Network response was not ok")

            const data = await response.json()

            this.#processVersions(pkg.version, data.tag_name)

            return data.tag_name
        } catch (error) {
            console.error(error)
        }
    }

    connectedCallback() {
        if (this.bus) {
            this._unsubEvent = this.bus.on('clear:history', () => {
                localStorage.removeItem('resultsHistory')
                this._resultsHistory = []
            })
        }
        if (this.state) {
            this._unsubState = this.state.subscribe((prop, val) => {
                if (prop === "compatViewTab") {
                    this.currentTab = val
                }
            })
        } else {
            console.warn("No state was provided to the CompatViewElement. This may cause syncing mistakes between it and the CompatView. If this was intentional, then ignore this warning.")
        }

        this.#retrieveResultsFromLocalStorage()

        document.adoptedStyleSheets.push(compatViewTransitions)
        this.#injectFontLink()

        if (this.shadowRoot)
            this.shadowRoot.adoptedStyleSheets = [hostStyleSheet, compatViewStyleSheet]

        this.shadowRoot?.appendChild(this.shadowHost)

        this.render()
    }

    disconnectedCallback() {
        const fontLink = document.getElementById('sk-font-doto')
        if (fontLink)
            document.head.removeChild(fontLink)
        if (this._unsubEvent) {
            this._unsubEvent()
        }
        if (this._unsubState) {
            this._unsubState()
        }

        document.adoptedStyleSheets = document.adoptedStyleSheets.filter(sheet => sheet !== compatViewTransitions)
    }

    /**
     * Renders the `CompatViewElement` on the overview tab by default.
     * @param {"overview" | "results" | "history" | undefined} tab 
     */
    render(tab = undefined) {
        this.shadowHost.innerHTML = compatViewHTML

        tab ? this.renderTabContent(tab) : this.renderTabContent("overview")
    }

    /**
     * Renders list items for the 5 most recent results.
     */
    renderRecentResults() {
        const list = this.shadowRoot?.getElementById('sk-recent-results-list')

        if (!list) return

        if (this._resultsHistory.length === 0) {
            if (list) list.innerHTML = `<p>NO PREVIOUS RESULTS</p>`
            return
        }

        const recentSnapshots = this._resultsHistory.slice(0, 5).map(snap => {
            const item = /**@type {RecentResultItem} */(document.createElement('sk-recent-result-item'))
            item.classList.add("sk-recent-results-item-container")
            item.result = snap
            item.viewResult = (res) => !document.startViewTransition ? this.renderCompatResult(res) : this.#handleViewResultTransition(res)
            item.innerHTML = `
                <div class="sk-recent-results-item">
                        <p>${snap.checkedAt}</p>
                        <p>${snap.overall_score}</p>
                        <button class="sk-view-result sk-button-style">Details</button>
                </div>
                <hr class="sk-hr-line">
            `

            return item
        })

        if (list) list.replaceChildren(...recentSnapshots)
    }

    /**
     * @param {CompatSnapshot} res 
     */
    async #handleViewResultTransition(res) {
        const sharedState = this.state?.getState()
        const mainSection = this.shadowRoot?.getElementById('sk-compat-view-main')

        if (mainSection) {
            const tabs = ["overview", "results", "history"]
            const direction = tabs.indexOf("results") > tabs.indexOf(this.currentTab) ? "forward" : "backward"

            mainSection.part.value = "compat-view"
            document.documentElement.dataset.transition = direction

            if (sharedState) sharedState.compatViewTab = "results"

            const transition = document.startViewTransition(() => this.renderCompatResult(res))

            try {
                await transition.finished
            } finally {
                mainSection.removeAttribute('part')
                delete document.documentElement.dataset.transition
            }
        }
    }

    /**
     * Renders content for a specific tab.
     * @param {"overview" | "results" | "history"} tab 
     */
    renderTabContent(tab) {
        const main = this.shadowRoot?.getElementById('sk-compat-view-main')

        switch (tab) {
            case 'overview':
                if (main) {
                    main.innerHTML = compatViewOverviewHTML
                    this.checkVersion()
                    this.renderRecentResults()
                }
                break;
            case 'results':
                this.renderCompatResult()
                break;
            case 'history':
                this.renderHistoryResults()
                break;
        }
    }

    renderHistoryResults() {
        const main = this.shadowRoot?.getElementById('sk-compat-view-main')

        if (!main) {
            return
        } else if (this._resultsHistory.length === 0) {
            main.innerHTML = `<p>NO PREVIOUS RESULTS</p>`
            return
        } else {
            main.innerHTML = `<div id="sk-history-container" class="sk-history-container"></div>`
        }

        const historyContainer = this.shadowRoot?.getElementById('sk-history-container')

        const historyResults = this._resultsHistory.map(snapshot => {
            const historyItem = /**@type {ResultsHistoryItem} */(document.createElement('sk-history-item'))
            historyItem.result = snapshot
            historyItem.viewResult = (res) => !document.startViewTransition ? this.renderCompatResult(res) : this.#handleViewResultTransition(res)

            historyItem.innerHTML = `
                <div class="sk-history-item">
                    <p>Score ${snapshot.overall_score}</p>
                    <p>Check performed at: ${snapshot.checkedAt}</p>
                </div>
            `

            return historyItem
        })

        if (historyContainer) {
            const fragment = document.createDocumentFragment()
            historyResults.forEach(item => fragment.appendChild(item))
            historyContainer.appendChild(fragment)
        }
    }

    /**
     * Renders the content of a compatibility result.
     * @param {CompatSnapshot | undefined} snapshot 
     */
    renderCompatResult(snapshot = undefined) {
        const main = this.shadowRoot?.getElementById('sk-compat-view-main')
        const data = snapshot || this._resultsHistory[0]

        if (!main) {
            return
        } else if (!data) {
            main.innerHTML = `<p>NO RESULTS ARRIVING</p>`
            return
        } else {
            main.innerHTML = `
                <div class="sk-compat-result-container doto-regular">
                    <div class="sk-compat-result-header">
                        <div class="sk-compat-header-top">
                            <p>Score ${snapshot ? snapshot.overall_score : this._resultsHistory[0].overall_score}</p>
                            <p>Arrived</p>
                        </div>
                        <p>${snapshot ? snapshot.checkedAt : this._resultsHistory[0].checkedAt}</p>
                    </div>
                    <div id="sk-compat-results" class="sk-compat-results"></div>
                </div>
            `
        }

        const compatResultsContainer = this.shadowRoot?.getElementById('sk-compat-results')

        const compatResults = (snapshot ? snapshot : this._resultsHistory[0]).lookup_results.map((res, index) => {
            const score = parseInt(res.compat_score, 10)
            const rating = score >= 90 ? "On time" : score >= 60 ? "Delayed" : "Cancelled"
            return `
                <div class="sk-compat-result">
                    <div class="sk-general-result">
                        <div class="sk-general-result-meta">
                            <p>${res.compat_score}</p>
                            <p>${index + 1} ${res.name}</p>
                            <p ${rating === "Delayed" ? `style="color: var(--sk-results-yellow-foreground)"` : rating === "Cancelled" ? `style="color: var(--sk-results-red-foreground)"` : ""}>${rating}</p>
                        </div>
                        <div>
                            <p>Calling at: ${res.mdn_url ? `<a href="${res.mdn_url}" target="_blank">${res.mdn_url}</a>` : `<span style="color: var(--sk-results-red-foreground)">Missing</span>`}
                            </p>
                            <p>Browser Score: ${res.browser_score}</p>
                            <p>Status Score: ${res.status_score}</p>
                        </div>
                    </div>
                    <details>
                        <summary>Show Browser Results</summary>
                        <div class="sk-browser-results">
                            ${this.renderBrowserResults(res)}
                        </div>
                    </details>
                </div>
            `
        })

        if (compatResultsContainer) compatResultsContainer.innerHTML = compatResults.join("")
    }

    /**
     * Renders the content of a browser result for a web feature.
     * @param {LookupResult} lookupResult 
     * @returns {string} browser results HTML
     */
    renderBrowserResults(lookupResult) {
        /**@type {string[]} */
        let browserResults = []

        browserResults = lookupResult.browsers.map(browser => {
            const support = Array.isArray(browser.versions) ? browser.versions : browser.versions
            let versionParagraphs = []

            if (support instanceof Array) {
                support.forEach(statement => {
                    versionParagraphs.push(`
                        <p>Added in version: ${statement.version_added}</p>
                        ${statement.version_removed ? `<p>Removed in version: ${statement.version_removed}</p>` : ""}
                        ${statement.version_last ? `<p>Last in version: ${statement.version_last}</p>` : ""}
                        ${statement.partial_implementation ? `<p>Partially implemented in version: ${statement.partial_implementation}</p>` : ""}
                    `)
                })
            } else {
                versionParagraphs.push(`
                    <p>Added in version: ${support.version_added}</p>
                    ${support.version_removed ? `<p>Removed in version: ${support.version_removed}</p>` : ""}
                    ${support.version_last ? `<p>Last in version: ${support.version_last}</p>` : ""}
                    ${support.partial_implementation ? `<p>Partially implemented in version: ${support.partial_implementation}</p>` : ""}
                `)
            }

            return `
                <div class="sk-browser-result">
                    <div class="sk-browser-result-meta">
                        <p style="color: var(--sk-results-blue-foreground)">${browser.browser_name}</p>
                        <p>Safety ${browser.score.raw_score}</p>
                        <p>Market ${browser.score.weighted_score}</p>
                    </div>
                    <div>
                        ${versionParagraphs.join("")}
                    </div>
                </div>
            `
        })

        return browserResults.join("")
    }

    /**
     * Renders the display of the `CompatViewElement`
     * @param {"show" | "hide"} display 
     */
    renderDisplayTransition(display) {
        const compatView = this.shadowRoot?.getElementById('sk-compat-view-container')

        if (compatView) {
            if (display === "show") {
                compatView.style.display = "block"
            } else if (display === "hide") {
                compatView.style.display = "none"
            }
        }
    }
}