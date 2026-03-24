export type ShinkomEventMap = {
    "ci:toggle": CustomEvent<void>
    "ci:inspect": CustomEvent<string>
    "ci:switch": CustomEvent<void>
    "ci:create": CustomEvent<void>
    "ci:reset": CustomEvent<void>
    "ci:destroy": CustomEvent<void>
}

export type ShinkomEventBus = {
    addEventListener: <K extends keyof ShinkomEventMap>(type: K, listener: ShinkomEventListener<K>, options?: boolean | AddEventListenerOptions) => void;
    removeEventListener: <K extends keyof ShinkomEventMap>(type: K, listener: ShinkomEventListener<K>) => void;
    dispathEvent: <K extends keyof ShinkomEventMap>(event: ShinkomEventMap[K]) => boolean;
}

export type ShinkomEventListener<K extends keyof ShinkomEventMap> = (this: ShinkomEventBus, ev: ShinkomEventMap[K]) => void 

export type InspectorConfig = {
    disabled: boolean;
    keyboardShorcuts: boolean;
}
