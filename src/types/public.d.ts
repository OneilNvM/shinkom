import { CompatControlPanelElement } from '../core/elements';
import { SupportStatement } from './types';

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

export type UISharedStateProps = keyof UISharedState

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