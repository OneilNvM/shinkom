import { CompatResult } from './public'

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

/**@extends EventTarget */
export interface ShinkomEventTarget extends EventTarget {
    addEventListener: <K extends keyof ShinkomEventMap>(type: K | string, listener: ShinkomEventListener<K> | EventListenerOrEventListenerObject | null, options?: EventListenerOptions | boolean) => void;
    removeEventListener: <K extends keyof ShinkomEventMap>(type: K | string, callback: ShinkomEventListener<K> | EventListenerOrEventListenerObject | null) => void;
    dispatchEvent: <K extends keyof ShinkomEventMap>(event: ShinkomEventMap[K]) => boolean;
}

export type ShinkomEventListener<K extends keyof ShinkomEventMap> = (this: ShinkomEventTarget, ev: ShinkomEventMap[K]) => void

type VersionValue = string | false;
/**
 * This interface was referenced by `CompatDataFile`'s JSON-Schema
 * via the `definition` "support_statement".
 */
type SupportStatement = SimpleSupportStatement | [SimpleSupportStatement, SimpleSupportStatement, ...SimpleSupportStatement[]];
/**
 * This interface was referenced by `CompatDataFile`'s JSON-Schema
 * via the `definition` "simple_support_statement".
 */
interface SimpleSupportStatement {
    /**
     * A string (indicating which browser version added this feature), or the value false (indicating the feature is not supported).
     */
    version_added: VersionValue;
    /**
     * A string, indicating which browser version removed this feature.
     */
    version_removed?: string;
    /**
     * A string, indicating the last browser version that supported this feature. This is automatically generated.
     */
    version_last?: string;
    /**
     * A prefix to add to the sub-feature name (defaults to empty string). If applicable, leading and trailing '-' must be included.
     */
    prefix?: string;
    /**
     * An alternative name for the feature, for cases where a feature is implemented under an entirely different name and not just prefixed.
     */
    alternative_name?: string;
    /**
     * An optional array of objects describing flags that must be configured for this browser to support this feature.
     *
     * @minItems 1
     */
    flags?: [FlagStatement, ...FlagStatement[]];
    /**
     * An optional changeset/commit URL for the revision which implemented the feature in the source code, or the URL to the bug tracking the implementation, for the associated browser.
     */
    impl_url?: string | [string, string, ...string[]];
    /**
     * A boolean value indicating whether or not the implementation of the sub-feature deviates from the specification in a way that may cause compatibility problems. It defaults to false (no interoperability problems expected). If set to true, it is recommended that you add a note explaining how it diverges from the standard (such as that it implements an old version of the standard, for example).
     */
    partial_implementation?: true;
    /**
     * A string or array of strings containing additional information.
     */
    notes?: string | [string, string, ...string[]];
}
/**
 * This interface was referenced by `CompatDataFile`'s JSON-Schema
 * via the `definition` "flag_statement".
 */
interface FlagStatement {
    /**
     * An enum that indicates the flag type.
     */
    type: "preference" | "runtime_flag";
    /**
     * A string giving the name of the flag or preference that must be configured.
     */
    name: string;
    /**
     * A string giving the value which the specified flag must be set to for this feature to work.
     */
    value_to_set?: string;
}