export interface BrowserXEventMap {
    'ci:toggle': CustomEvent<void>;
}

export interface BrowserXBus extends EventTarget {
    addEventListener<K extends keyof BrowserXEventMap>(
        type: K,
        listener: (this: BrowserXBus, ev: BrowserXEventMap[K]) => void,
        options?: boolean | AddEventListenerOptions
    ): void,

    addEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject | null,
        options?: boolean | AddEventListenerOptions
    ): void,

    removeEventListener<K extends keyof BrowserXEventMap>(
        type: K,
        listener: (this: BrowserXBus, ev: BrowserXEventMap[K]) => void,
    ),

    removeEventListener(
        type: string,
        listener: EventListenerOrEventListenerObject | null,
        options?: boolean | AddEventListenerOptions
    ): void;

    dispatchEvent<K extends keyof BrowserXEventMap>(
        event: BrowserXEventMap[K] 
    )
}