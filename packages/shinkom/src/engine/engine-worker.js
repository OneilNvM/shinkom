import { SKEngine } from "./engine"
/**@type {SKEngine | null} */
let skEngine = null

self.onmessage = async (event) => {
    const { id, type, payload } = event.data

    try {
        switch (type) {
            case "INIT": {
                skEngine = new SKEngine(payload.config)

                await skEngine.initEngine(payload.compiledCss)

                self.postMessage({ id, type: "SUCCESS" })

                break;
            }
            case "CHECK_ELEMENT": {
                if (!skEngine) throw new Error('Engine is not initialized')

                const { element } = payload

                const result = skEngine.checkElement(element)

                self.postMessage({ id, type: "SUCCESS", result })

                break;
            }
            case "CHECK_ELEMENTS": {
                if (!skEngine) throw new Error('Engine is not initialized')

                const { html, depthLevel } = payload

                const result = skEngine.checkElements(html, depthLevel)

                self.postMessage({ id, type: "SUCCESS", result })

                break;
            }
            case "FULL_INSPECT": {
                if (!skEngine) throw new Error('Engine is not initialized')

                const { html } = payload
                skEngine.fullInspect(html)

                self.postMessage({ id, type: "SUCCESS" })

                break;
            }
            case "DESTROY": {
                if (skEngine) {
                    skEngine.destroy()
                    skEngine = null
                }

                self.postMessage({ id, type: "SUCCESS" })

                break;
            }
        }
    } catch (error) {
        self.postMessage({ id, type: "ERROR", error: error || String(error) })
    }
}