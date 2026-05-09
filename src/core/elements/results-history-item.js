/**@typedef {import("../../types/public").CompatSnapshot} CompatSnapshot */

export class ResultsHistoryItem extends HTMLElement {
    constructor() {
        super()

        /**@type {CompatSnapshot | null} */
        this._result = null

        /**@type {function(CompatSnapshot): void} */
        this.viewResult = () => {}
    }

    get result() {
        return this._result
    }

    set result(val) {
        if (val)
            this._result = val
    }

    connectedCallback() {
        const historyItem = this.querySelector('.sk-history-item')

        if (historyItem instanceof HTMLDivElement) {
            historyItem.addEventListener('click', () => {
                if (this.result) {
                    this.viewResult(this.result)
                }
            })
        }
    }
}