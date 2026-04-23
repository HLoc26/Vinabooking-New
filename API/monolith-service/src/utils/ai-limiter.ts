import pLimit from "p-limit";

/**
 * Restrict concurrent AI calls to respect Gemini's Free Tier/Standard Tier rate limits.
 */
export const aiLimiter = pLimit(2);
