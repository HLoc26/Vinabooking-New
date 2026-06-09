import { container } from "tsyringe";
import type { DependencyContainer } from "tsyringe";

/** The application's root DI container. Modules register their bindings here. */
export const appContainer: DependencyContainer = container;

export type { DependencyContainer };
