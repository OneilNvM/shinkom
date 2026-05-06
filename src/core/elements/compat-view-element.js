/**@typedef {import('../../types/public').CompatResult} CompatResult */
/**@typedef {import('../../types/public').CompatSnapshot} CompatSnapshot */
/**@typedef {import('../../types/public').LookupResult} LookupResult */

import { ShinkomState } from '../state-service'
import { RecentResultItem } from './recent-result-item'
import { compatViewHTML, compatViewOverviewHTML, compatViewStyleSheet } from './templates/compat-view.templates'
import { hostStyleSheet } from './templates/root-styles.template'

/**@extends {HTMLElement} */
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

        this.updateResultHistory({
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
     * @param {CompatSnapshot} val 
     */
    updateResultHistory(val) {
        this._resultsHistory = [val, ...this._resultsHistory].slice(0, 10)

        this.backupResultsToLocalStorage()

        console.dir(this._resultsHistory)
    }

    retrieveResultsFromLocalStorage() {
        const resultsHistory = localStorage.getItem("resultsHistory")
        if (resultsHistory) {
            this._resultsHistory = JSON.parse(resultsHistory)
        }
    }

    backupResultsToLocalStorage() {
        localStorage.setItem("resultsHistory", JSON.stringify(this._resultsHistory))
    }

    #injectFontLink() {
        const link = document.createElement('link')

        link.href = "https://fonts.googleapis.com/css2?family=Doto:wght,ROND@700,100&display=swap"
        link.rel = "stylesheet"

        document.head.appendChild(link)
    }

    connectedCallback() {
        this.state?.subscribe((prop, val) => {
            if (prop === "currentTab") {
                this.currentTab = val
            }
        })

        this.retrieveResultsFromLocalStorage()

        this.#injectFontLink()

        if (this.shadowRoot)
            this.shadowRoot.adoptedStyleSheets = [hostStyleSheet, compatViewStyleSheet]

        this.shadowRoot?.appendChild(this.shadowHost)

        this.render()
    }

    /**
     * @param {"overview" | "results" | "history" | undefined} tab 
     */
    render(tab = undefined) {
        this.shadowHost.innerHTML = compatViewHTML

        if (tab) {
            this.renderTabContent(tab)
        } else {
            this.renderTabContent("overview")
        }
    }

    /**
     * Renders recent results list items
     */
    renderRecentResults() {
        const list = this.shadowRoot?.getElementById('sk-recent-results-list')
        /**@type {RecentResultItem[]} */
        let recentSnapshots = []

        if (this._resultsHistory.length < 5) {
            recentSnapshots = this._resultsHistory.map(snap => {
                const recentResultItem = /**@type {RecentResultItem} */(document.createElement('sk-recent-result-item'))
                recentResultItem.classList.add("sk-recent-results-item-container")
                recentResultItem.result = snap
                recentResultItem.viewResult = (res) => {
                    if (!document.startViewTransition) {
                        this.renderCompatResult(res)
                    } else {
                        document.startViewTransition(() => {
                            this.renderCompatResult(res)
                        })
                    }
                }
                recentResultItem.innerHTML = `
                    <li class="sk-recent-results-item">
                            <p>${snap.checkedAt}</p>
                            <p>${snap.overall_score}</p>
                            <button class="sk-view-result sk-button-style">Details</button>
                    </li>
                    <hr class="sk-hr-line">
                `

                return recentResultItem
            })
        } else {
            let counter = 0
            while (counter < 5) {
                const recentResultItem = /**@type {RecentResultItem} */(document.createElement('sk-recent-result-item'))
                recentResultItem.setAttribute('is', 'sk-recent-result-item')
                recentResultItem.classList.add("sk-recent-results-item-container")
                recentResultItem.result = this._resultsHistory[counter]
                recentResultItem.viewResult = (res) => {
                    if (!document.startViewTransition) {
                        this.renderCompatResult(res)
                    } else {
                        document.startViewTransition(() => {
                            this.renderCompatResult(res)
                        })
                    }
                }
                recentResultItem.innerHTML = `
                    <li class="sk-recent-results-item">
                            <p>${this._resultsHistory[counter].checkedAt}</p>
                            <p>${this._resultsHistory[counter].overall_score}</p>
                            <button class="sk-view-result sk-button-style">Details</button>
                    </li>
                    <hr class="sk-hr-line">
                `

                recentSnapshots.push(recentResultItem)
                counter++
            }
        }

        if (list) {
            list.innerHTML = ""
            recentSnapshots.forEach(item => {
                list.appendChild(item)
            })
        }
    }

    /**
     * @param {"overview" | "results" | "history"} tab 
     */
    renderTabContent(tab) {
        const main = this.shadowRoot?.getElementById('sk-compat-view-main')
        switch (tab) {
            case 'overview':
                if (main) {
                    main.innerHTML = compatViewOverviewHTML
                }
                this.currentTab = tab
                this.renderRecentResults()
                break;
            case 'results':
                this.renderCompatResult()
                break;
            case 'history':
                break;
        }
    }

    /**
     * @param {CompatSnapshot | undefined} snapshot 
     */
    renderCompatResult(snapshot = undefined) {
        const state = this.state?.getState()
        if (state)
            state.currentTab = "results"

        const main = this.shadowRoot?.getElementById('sk-compat-view-main')
        if (main) {
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

        /**@type {string[]} */
        let compatResults = []

        compatResults = (snapshot ? snapshot : this._resultsHistory[0]).lookup_results.map((res, index) => {
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
                </div>
            `
        })

        if (compatResultsContainer)
            compatResultsContainer.innerHTML = compatResults.join("")
    }

    /**
     * @param {LookupResult} lookupResult 
     * @returns {string} result string
     */
    renderBrowserResults(lookupResult) {
        /**@type {string[]} */
        let browserResults = []

        browserResults = lookupResult.browsers.map(browser => {
            const support = Array.isArray(browser.versions) ? browser.versions[0] : browser.versions
            return `
                <div class="sk-browser-result">
                    <div class="sk-browser-result-meta">
                        <p>${browser.browser_name}</p>
                        <p>Safety ${browser.score.raw_score}</p>
                        <p>Market ${browser.score.weighted_score}</p>
                    </div>
                    <p>Added in version: ${support.version_added}</p>
                </div>
            `
        })

        return browserResults.join("")
    }

    /**
     * @param {"show" | "hide"} display 
     */
    renderDisplayTransition(display) {
        const compatView = this.shadowRoot?.getElementById('sk-compat-view-container')
        if (display === "show") {
            if (compatView) {
                compatView.style.display = "block"
            }
        } else if (display === "hide") {
            if (compatView) {
                compatView.style.display = "none"
            }
        }
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