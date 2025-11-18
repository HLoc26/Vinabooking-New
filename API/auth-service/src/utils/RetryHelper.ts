export async function retry<T>(fn: () => Promise<T>, retries = 5): Promise<T> {
	let lastError: unknown;
	for (let i = 0; i < retries; i++) {
		try {
			return await fn();
		} catch (err) {
			lastError = err;
		}
	}
	throw lastError;
}
