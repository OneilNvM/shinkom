'use client'

import { useEffect } from 'react'
import { Shinkom } from 'shinkom'

export default function ShinkomClient() {
    useEffect(() => {
        const compiledCss = Array.from(document.styleSheets)
            .flatMap((sheet) => {
                try {
                    return Array.from(sheet.cssRules).map((rule) => rule.cssText);
                } catch {
                    return [];
                }
            })
            .join('\n');
        const shinkom = new Shinkom({ inspector: { disabled: true }, engine: { css: { externalCSS: { imports: [compiledCss] } } } })

        shinkom.init()

        console.log(compiledCss)

        return () => shinkom.destroy()
    }, [])
    return null
}
