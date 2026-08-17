import { SKEngine } from '../lib/shinkom-lib';
import wasm from '../pkg/shinkore_bg.wasm?url'
import { colorizeJson } from './helpers';

const mockHTML = `
<div style="display: grid; gap: 20px;">
    <dialog open>
        <p>Testing native dialog elements</p>
    </dialog>
    <picture>
        <source srcset="image.webp" type="image/webp">
        <img src="image.jpg" alt="Fallback">
    </picture>
</div>`

async function runAnalysis(html) {
    const engine = new SKEngine()

    try {
        document.getElementById('node-demo-output').textContent = "Initialising engine..."
        await engine.initEngine(wasm)

        const depthLevel = 3
        const result = engine.checkElements(html, depthLevel)

        if (result) {
            return result
        } else {
            console.log("No results returned")
        }

    } catch (error) {
        console.error(`Run failed: ${error}`)
    } finally {
        engine.destroy()
    }
}

async function copyCodeToClipboard() {
    const code = `import { SKEngine } from 'shinkom/engine';

const mockHTML = \`
<div style="display: grid; gap: 20px;">
    <dialog open>
        <p>Testing native dialog elements</p>
    </dialog>
    <picture>
        <source srcset="image.webp" type="image/webp">
        <img src="image.jpg" alt="Fallback">
    </picture>
</div>\`

async function runAnalysis(html) {
    const engine = new SKEngine()
    try {
        await engine.initEngine()
        const depthLevel = 3
        const result = engine.checkElements(html, depthLevel)

        if (!result) {
            console.log("No results returned")
        }
    } catch (error) {
        console.error(\`Run failed: \${error}\`)
    } finally {
        engine.destroy()
    }
}
    
runAnalysis(mockHTML)`

    try {
        await navigator.clipboard.writeText(code)

        console.log("code copied to clipboard!")
    } catch (error) {
        console.error(error)
    }
}

const runCodeButton = document.getElementById('run-code-btn')
const copyButton = document.getElementById('cp-code-btn')

runCodeButton.addEventListener('click', async () => {
    const result = await runAnalysis(mockHTML)

    document.getElementById('node-demo-output').innerHTML = colorizeJson(result)
})
copyButton.addEventListener('click', copyCodeToClipboard)

