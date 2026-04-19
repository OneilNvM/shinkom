import data from 'caniuse-db/fulldata-json/data-2.0.json' with {type: 'json'}
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path'

type UsageGlobal = Map<string, number>
type Output = {
    agents: {
        [key: string]: UsageGlobal
    },
    marketShare: number
}

//@ts-ignore
const agents = data.agents;

const skipAgents = ["and_qq", "and_uc", "baidu", "bb", "ie_mob", "kaios", "op_mini", "op_mob", "ie"]
const browserNameMap = new Map([
    ["and_chr", "chrome_android"],
    ["and_ff", "firefox_android"],
    ["android", "webview_android"],
    ["ios_saf", "safari_ios"],
    ["samsung", "samsunginternet_android"],
])

const output: Output = {
    agents: {},
    marketShare: 0
}

const extractUsageData = () => {
    let marketShare = 0;
    for (const [agent, data] of Object.entries(agents)) {
        if (!skipAgents.includes(agent)) {
            if (browserNameMap.has(agent)) {
                //@ts-ignore
                output.agents[browserNameMap.get(agent)] = data.usage_global;

                marketShare += Object.values(output.agents[browserNameMap.get(agent)!]).values().reduce((acc, cur) => acc += cur)
            } else {
                //@ts-ignore
                output.agents[agent] = data.usage_global;

                marketShare += Object.values(output.agents[agent]).values().reduce((acc, cur) => acc += cur)
            }
        }
    }

    output.marketShare = marketShare

    console.log(marketShare)

    const outDir = path.resolve("./gen")

    if (!existsSync(outDir)) mkdirSync('./gen')

    writeFileSync(path.join(outDir, "browser-usage-data.json"), JSON.stringify(output))

    console.log("Successfully generated browser-usage-data JSON file")
}

extractUsageData()