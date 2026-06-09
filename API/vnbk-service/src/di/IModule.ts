import type { DependencyContainer } from "tsyringe";

/**
 * A feature module's DI configuration unit (Spring @Configuration analog).
 * Each module binds its interface tokens to implementations and registers its
 * router under the ROUTER token.
 */
export interface IModule {
	register(container: DependencyContainer): void;
}
