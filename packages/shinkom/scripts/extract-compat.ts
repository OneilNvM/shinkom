import bcd, { CompatStatement, Identifier } from '@mdn/browser-compat-data'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const htmlData = bcd.html
const svgData = bcd.svg
const cssData = bcd.css

const htmlOutput = {
    html: {
        elements: {} as Record<string, Record<string, any>>,
        global_attributes: {} as Record<string, any>,
    },
}

const svgOutput = {
    svg: {
        elements: {} as Record<string, Record<string, any>>,
        global_attributes: {} as Record<string, any>,
    },
}

const cssOutput = {
    css: {
        properties: {} as Record<string, Record<string, any>>
    }
}

const getCompatData = (data: any): CompatStatement | undefined => (data as Identifier).__compat

const extractData = () => {
    extractHTMLData()
    extractSVGData()
    extractCSSData()

    console.log("Successfully generated compatibility data files!")
}

const extractHTMLData = () => {
    extractHTMLElements()
    extractHTMLGlobalAttributes()

    const outDir = path.resolve("./gen")
    if (!existsSync(outDir)) mkdirSync(outDir)

    writeFileSync(path.join(outDir, 'html-compat-data.json'), JSON.stringify(htmlOutput))

    console.log("Successfully generated html-compat-data JSON file.")
}

const extractSVGData = () => {
    extractSVGElements()
    extractSVGGlobalAttributes()

    const outDir = path.resolve("./gen")
    if (!existsSync(outDir)) mkdirSync(outDir)

    writeFileSync(path.join(outDir, 'svg-compat-data.json'), JSON.stringify(svgOutput))

    console.log("Successfully generated svg-compat-data JSON file.")
}

const extractCSSData = () => {
    extractCSSProperties()

    const outDir = path.resolve("./gen")
    if (!existsSync(outDir)) mkdirSync(outDir)

    writeFileSync(path.join(outDir, 'css-compat-data.json'), JSON.stringify(cssOutput))

    console.log("Successfully generated css-compat-data JSON file.")
}


const extractHTMLElements = () => {
    for (const [tag, tagData] of Object.entries(htmlData.elements)) {
        const elCompat = getCompatData(tagData)

        if (elCompat) {
            htmlOutput.html.elements[tag] = {
                __compat: {
                    description: elCompat.description,
                    mdn_url: elCompat.mdn_url,
                    source_file: elCompat.source_file,
                    spec_url: elCompat.spec_url,
                    status: elCompat.status,
                    support: elCompat.support,
                    tags: elCompat.tags,
                },
            }
        }

        if (tag === "input") {
            for (const [inputAttr, inputData] of Object.entries(htmlData.elements.input)) {
                const inputCompat = getCompatData(inputData)

                if (inputCompat) {
                    htmlOutput.html.elements[tag][inputAttr] = {
                        __compat: {
                            description: inputCompat.description,
                            mdn_url: inputCompat.mdn_url,
                            source_file: inputCompat.source_file,
                            spec_url: inputCompat.spec_url,
                            status: inputCompat.status,
                            support: inputCompat.support,
                            tags: inputCompat.tags,
                        },
                    }
                }
            }
            continue
        }

        for (const [attr, attrData] of Object.entries(tagData)) {
            if (attr === "__compat") continue;

            const attrCompat = getCompatData(attrData)

            if (attrCompat) {
                htmlOutput.html.elements[tag] = {
                    ...htmlOutput.html.elements[tag],
                    [attr]: {
                        __compat: {
                            description: attrCompat.description,
                            mdn_url: attrCompat.mdn_url,
                            source_file: attrCompat.source_file,
                            spec_url: attrCompat.spec_url,
                            status: attrCompat.status,
                            support: attrCompat.support,
                            tags: attrCompat.tags,
                        },
                    }
                }
            }
        }
    }
}

const extractSVGElements = () => {
    for (const [svg, tagData] of Object.entries(svgData.elements)) {
        const elCompat = getCompatData(tagData)

        if (elCompat) {
            svgOutput.svg.elements[svg] = {
                __compat: {
                    description: elCompat.description,
                    mdn_url: elCompat.mdn_url,
                    source_file: elCompat.source_file,
                    spec_url: elCompat.spec_url,
                    status: elCompat.status,
                    support: elCompat.support,
                    tags: elCompat.tags,
                }
            }
        }

        for (const [attr, attrData] of Object.entries(tagData)) {
            if (attr === "__compat") continue;

            const attrCompat = getCompatData(attrData)

            if (attrCompat) {
                svgOutput.svg.elements[svg] = {
                    ...svgOutput.svg.elements[svg],
                    [attr]: {
                        __compat: {
                            description: attrCompat.description,
                            mdn_url: attrCompat.mdn_url,
                            source_file: attrCompat.source_file,
                            spec_url: attrCompat.spec_url,
                            status: attrCompat.status,
                            support: attrCompat.support,
                            tags: attrCompat.tags,
                        },
                    }
                }
            }
        }
    }
}

const extractHTMLGlobalAttributes = () => {
    for (const [attribute, data] of Object.entries(htmlData.global_attributes)) {
        const compat = getCompatData(data)

        if (compat) {
            htmlOutput.html.global_attributes[attribute] = {
                __compat: {
                    description: compat.description,
                    mdn_url: compat.mdn_url,
                    source_file: compat.source_file,
                    spec_url: compat.spec_url,
                    status: compat.status,
                    support: compat.support,
                    tags: compat.tags,
                }
            }
        }
    }
}

const extractSVGGlobalAttributes = () => {
    for (const [attribute, data] of Object.entries(svgData.global_attributes)) {
        const compat = getCompatData(data)

        if (compat) {
            svgOutput.svg.global_attributes[attribute] = {
                __compat: {
                    description: compat.description,
                    mdn_url: compat.mdn_url,
                    source_file: compat.source_file,
                    spec_url: compat.spec_url,
                    status: compat.status,
                    support: compat.support,
                    tags: compat.tags,
                }
            }
        }
    }
}

const extractCSSProperties = () => {
    for (const [prop, propData] of Object.entries(cssData.properties)) {
        const propCompat = getCompatData(propData)

        if (propCompat) {
            cssOutput.css.properties[prop] = {
                __compat: {
                    description: propCompat.description,
                    mdn_url: propCompat.mdn_url,
                    source_file: propCompat.source_file,
                    spec_url: propCompat.spec_url,
                    status: propCompat.status,
                    support: propCompat.support,
                    tags: propCompat.tags,
                }
            }
        }

        for (const [keyword, keywordData] of Object.entries(propData)) {
            const keywordCompat = getCompatData(keywordData)

            if (keywordCompat) {
                cssOutput.css.properties[prop] = {
                    ...cssOutput.css.properties[prop],
                    [keyword]: {
                        __compat: {
                            description: keywordCompat.description,
                            mdn_url: keywordCompat.mdn_url,
                            source_file: keywordCompat.source_file,
                            spec_url: keywordCompat.spec_url,
                            status: keywordCompat.status,
                            support: keywordCompat.support,
                            tags: keywordCompat.tags,
                        }
                    }
                }
            }
        }
    }
}

extractData()