import fs from 'node:fs'
import path from 'node:path'

const rustGenDir = path.resolve('../../crates/shinkore/gen')
const jsGenDir = path.resolve('./gen')

if (fs.existsSync(rustGenDir) && fs.existsSync(jsGenDir)) {
    bin2Base64("html-compat-data.bin")
    bin2Base64("svg-compat-data.bin")
    bin2Base64("css-compat-data.bin")
    bin2Base64("browser-data.bin")
    bin2Base64("browser-usage-data.bin")
}

function bin2Base64(filename: string) {
    const filePath = path.join(rustGenDir, filename)
    const file = fs.readFileSync(filePath)

    const encoded = file.toString('base64')

    let genFileName = filename.split('.')[0];

    genFileName = genFileName.split('-').map((part, index) => {
        if (index !== 0) {
            const firstChar = part.charAt(0).toUpperCase()
            let remainingChars = part.slice(1)
            return firstChar + remainingChars
        } else {
            return part
        }
    }).join("")

    fs.writeFileSync(path.join(jsGenDir, `${filename}.js`), `export const ${genFileName}B64 = "${encoded}"`)
}