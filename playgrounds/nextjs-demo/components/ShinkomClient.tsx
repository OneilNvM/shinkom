'use client'

import { useEffect } from 'react'
import { Shinkom } from 'shinkom'

export default function ShinkomClient() {
    useEffect(() => {

        const shinkom = new Shinkom({ inspector: { disabled: false }, engine: { css: { tailwindCSS: true } } })

        shinkom.init()

        return () => shinkom.destroy()
    }, [])
    return null
}
