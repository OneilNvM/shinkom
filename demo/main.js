import BrowserX from "../src/browserx/browserx"

const config = {
    disabled: false,
    keyboardShortcuts: true
}

const browserx = new BrowserX(config)

browserx.init()

console.log(`Inspector is ${browserx.compatInspector.config.disabled ? 'disabled' : 'enabled'}`)