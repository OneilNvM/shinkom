import { CompatInspector } from "../src"

const config = {
    keyboardShortcuts: true
}

const inspector = new CompatInspector(config)

inspector.setup()

console.log(`Inspector is ${inspector.config.disabled ? 'disabled' : 'enabled'}`)