import { SupportStatement } from '@mdn/browser-compat-data/types'
import { CompatControlPanelElement } from '../core/elements';

export type ShinkomEventMap = {
    "ci:toggle": CustomEvent<void>;
    "ci:switch": CustomEvent<void>;
    "ci:create": CustomEvent<void>;
    "ci:reset": CustomEvent<void>;
    "ci:destroy": CustomEvent<void>;
    "engine:inspect": CustomEvent<CustomEventEngineDetail>;
    "engine:full": CustomEvent<CustomEventEngineDetail>;
    "results:ready": CustomEvent<CompatResult>
}

export type CustomEventEngineDetail = {
    elem: string;
    depthLevel: number;
    multiElements: boolean;
}

export interface ShinkomEventTarget extends EventTarget {
    addEventListener: <K extends keyof ShinkomEventMap>(type: K | string, listener: ShinkomEventListener<K> | EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean) => void;
    removeEventListener: <K extends keyof ShinkomEventMap>(type: K | string, callback: ShinkomEventListener<K> | EventListenerOrEventListenerObject | null) => void;
    dispatchEvent: <K extends keyof ShinkomEventMap>(event: ShinkomEventMap[K]) => boolean;
}

export type ShinkomEventListener<K extends keyof ShinkomEventMap> = (this: ShinkomEventTarget, ev: ShinkomEventMap[K]) => void

export type ShinkomConfig = {
    inspector?: InspectorConfig
    engine?: EngineConfig
}

export type InspectorConfig = {
    disabled: boolean;
    keyboardShortcuts?: boolean;
}

export type EngineConfig = {
    wasmURL: string
}

export type UISharedState = {
    inspectorExists: boolean;
    inspectorActive: boolean;
    inspectorSwitching: boolean;
    multiElements: boolean;
    depthLevel: number;
    ignorePanelEl: CompatControlPanelElement | null;
}

export type CompatResult = {
    overall_score: number;
    lookup_results: LookupResult[];
}

export type CompatSnapshot = CompatResult & {
    checkedAt: string
}

export type LookupResult = {
    name: string;
    mdn_url: string;
    compat_score: string;
    browser_score: string;
    status_score: string;
    browsers: BrowserResult[];
}

export type BrowserResult = {
    browser_name: string;
    score: {
        raw_score: string;
        weighted_score: string;
    };
    versions: SupportStatement
}

export type UISharedStateProps = keyof UISharedState