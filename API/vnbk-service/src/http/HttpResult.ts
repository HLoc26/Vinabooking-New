/** The value a controller handler returns: an HTTP status + a body to envelope. */
export class HttpResult<T> {
	constructor(
		public readonly status: number,
		public readonly body: T
	) {}
}
