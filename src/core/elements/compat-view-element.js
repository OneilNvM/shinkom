/**@typedef {import('../../types/public').CompatResult} CompatResult */
/**@typedef {import('../../types/public').CompatSnapshot} CompatSnapshot */

/**@extends {HTMLElement} */
export class CompatViewElement extends HTMLElement {
    constructor() {
        super()
        this.attachShadow({ mode: 'open' })

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

        console.log(`The score of this result is ${this._results?.overall_score}`)
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
            console.log("results history retrieved from local storage!")
        }
    }

    backupResultsToLocalStorage() {
        localStorage.setItem("resultsHistory", JSON.stringify(this._resultsHistory))
    }

    connectedCallback() {
        this.retrieveResultsFromLocalStorage()

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