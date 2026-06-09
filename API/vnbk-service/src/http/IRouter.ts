import type { Router } from "express";

/** A mountable feature router. AppRouter mounts each one at its basePath. */
export interface IRouter {
	readonly basePath: string;
	readonly router: Router;
}
