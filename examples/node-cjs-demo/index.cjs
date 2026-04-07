const SKEngine = require('shinkom/engine').SKEngine

const shinkomEngine = new SKEngine()

const startEngine = async () => {
    await shinkomEngine.initEngine()
}

const run = async () => {
    await startEngine()

    const html = `
    <div id="container" class="demo-container" align="center" random="0.7">
        <p>Hello Shinkom</p>
    </div>
    `

    console.log(shinkomEngine)

    shinkomEngine.checkElement(html)

    shinkomEngine.checkElements(html, 1)
}

run()