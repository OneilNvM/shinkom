import { BrowserX } from '../src'

const config = {
    disabled: false,
    keyboardShortcuts: true
}

const browserx = new BrowserX(config)

browserx.init()

console.log(`Inspector is ${browserx.compatUI.compatInspector.config.disabled ? 'disabled' : 'enabled'}`)