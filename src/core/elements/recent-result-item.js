/**@typedef {import('../../types/public').CompatSnapshot} CompatSnapshot */

export class RecentResultItem extends HTMLElement {
    constructor() {
        super()

        /**@type {CompatSnapshot | null} */
        this._result = null

        /** @type {function(CompatSnapshot): void} */
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
        const detailsButton = this.querySelector('.sk-view-result')

        if (detailsButton instanceof HTMLButtonElement) {
            detailsButton.addEventListener('click', () => {
                if (this.result)
                    this.viewResult(this.result)
            })
        }
    }
}