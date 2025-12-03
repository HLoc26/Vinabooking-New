import type { ContextInfo } from "../services/context/ContextInfoAdapter";

/**
 * Returns the provided ContextInfo.
 */
export function useContextInfo(info: ContextInfo): ContextInfo {
    return info;
}
