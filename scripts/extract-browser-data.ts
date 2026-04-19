import bcd from '@mdn/browser-compat-data'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const skipBrowsers = ["bun", "deno", "nodejs"]
const browserData = bcd.browsers

const output = {
    browsers: {} as Record<string, any>
}

const extractBrowserData = () => {
    for (const [browser, data] of Object.entries(browserData)) {
        if (skipBrowsers.includes(browser)) {
            continue;
        }
        for (const [release, statement] of Object.entries(data.releases)) {
            if (statement.status === "current") {
                output.browsers[browser] = {
                    [release]: statement
                }
                break;
            }
        }
    }

    const outDir = path.resolve('./gen')

    if (!existsSync(outDir)) mkdirSync('./gen')
    
    writeFileSync(path.join(outDir, "browser-data.json"), JSON.stringify(output))
    
    console.log("Successfully generated browser-data JSON file")
}

extractBrowserData()