import { BrowserX } from '../src'

const config = {
    disabled: true,
    keyboardShortcuts: true
}

const browserx = new BrowserX(config)

browserx.init()

console.log(`Inspector is ${browserx.compatUI.compatInspector.config.disabled ? 'disabled' : 'enabled'}`)