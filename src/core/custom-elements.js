/**@typedef {import('../types/public').CompatResult} CompatResult */
export class CompatViewElement extends HTMLElement {
    constructor() {
        super()

        /**@type {CompatResult | null} */
        this._results = null
    }

    get results() {
        return this._results
    }

    set results(val) {
        this._results = val;
        console.log(`The score of this result is ${this._results?.overall_score}`)
    }

    connectedCallback() {
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