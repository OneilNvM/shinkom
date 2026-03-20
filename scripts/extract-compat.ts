import bcd, { CompatStatement, Identifier } from '@mdn/browser-compat-data'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'

const htmlData = bcd.html

const output = {
    elements: {} as Record<string, Record<string, any>>,
    global_attributes: {} as Record<string, any>,
}

const getCompatData = (data: any): CompatStatement | undefined => (data as Identifier).__compat

const extractData = () => {
    for (const [tag, tagData] of Object.entries(htmlData.elements)) {
        const elCompat = getCompatData(tagData)

        if (elCompat) {
            output.elements[tag] = {
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

        for (const [attr, attrData] of Object.entries(tagData)) {
            if (attr === "__compat") continue;

            const attrCompat = getCompatData(attrData)

            if (attrCompat) {
                output.elements[tag] = {
                    ...output.elements[tag],
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

    for (const [attribute, data] of Object.entries(htmlData.global_attributes)) {
        const compat = getCompatData(data)

        if (compat) {
            output.global_attributes[attribute] = {
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

    const outDir = path.resolve("./src/gen")
    if (!existsSync(outDir)) mkdirSync(outDir)

    writeFileSync(path.join(outDir, 'compat-data.json'), JSON.stringify(output))

    console.log("Successfully generated compat-data JSON file.")
}

extractData()