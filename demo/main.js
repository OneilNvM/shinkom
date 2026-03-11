import { BrowserX } from '../src/browserx'

const config = {
    disabled: true,
    keyboardShortcuts: true
}

const browserx = new BrowserX(config)

browserx.init()

console.log(`Inspector is ${browserx.compatInspector.config.disabled ? 'disabled' : 'enabled'}`)