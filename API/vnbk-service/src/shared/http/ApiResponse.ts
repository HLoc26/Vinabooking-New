/**
 * The single response envelope every endpoint returns. Kept identical to the
 * monolith ({ success, data, error }) so the two services can be diffed.
 */
export interface ApiResponse<T = unknown> {
	success: boolean;
	data: T | null;
	error: string | null;
}
