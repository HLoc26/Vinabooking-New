import type { ContextInfoAdapter } from "../context/ContextInfoAdapter";

/**
 * Returns the provided ContextInfo.
 */
export function useContextInfo(info: ContextInfoAdapter): ContextInfoAdapter {
	return info;
}
