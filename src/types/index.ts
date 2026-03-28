export type ShinkomEventMap = {
    "ci:toggle": CustomEvent<void>
    "engine:inspect": CustomEvent<CustomEventEngineDetail>
    "ci:switch": CustomEvent<void>
    "ci:create": CustomEvent<void>
    "ci:reset": CustomEvent<void>
    "ci:destroy": CustomEvent<void>,
    "engine:full": CustomEvent<CustomEventEngineDetail>
}

export interface ShinkomEventTarget extends EventTarget {
    addEventListener<K extends keyof ShinkomEventMap>(
        type: K,
        listener: ShinkomEventListener<K>,
        options?: boolean | AddEventListenerOptions
    ): void;
    addEventListener(
        type: string,
        callback: EventListenerOrEventListenerObject | null,
        options?: EventListenerOptions | boolean
    ): void;
    removeEventListener: <K extends keyof ShinkomEventMap>(type: K | string, callback: ShinkomEventListener<K> | EventListenerOrEventListenerObject | null) => void;
    dispatchEvent: <K extends keyof ShinkomEventMap>(event: ShinkomEventMap[K]) => boolean;
}

export type ShinkomEventListener<K extends keyof ShinkomEventMap> = (this: ShinkomEventTarget, ev: ShinkomEventMap[K]) => void

export type InspectorConfig = {
    disabled: boolean;
    keyboardShorcuts: boolean;
}

export type UISharedState = {
    inspectorSwitching: boolean,
    inspectorActive: boolean,
    ignorePanelEl: HTMLDivElement | null,
    multiElements: boolean,
    depthLevel: number
}

export type CustomEventEngineDetail = {
    elem: string,
    depthLevel: number,
    multiElements: boolean
}

export type UISharedStateProps = keyof UISharedState
