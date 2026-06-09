import { Router } from "express";
import type { IRouter } from "@/http/IRouter";

/**
 * Base for feature routers. Holds the Express Router; subclasses declare their
 * basePath and implement registerRoutes(). Subclasses MUST call
 * `this.registerRoutes()` at the END of their own constructor (after their
 * injected controller/guards are assigned) — not from here, because a base-class
 * constructor runs before the subclass's parameter properties are set.
 */
export abstract class BaseRouter implements IRouter {
	public readonly router: Router = Router();

	public abstract get basePath(): string;

	protected abstract registerRoutes(): void;
}
