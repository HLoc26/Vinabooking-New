import type { DependencyContainer } from "@/di/container";
import type { IModule } from "@/di/IModule";
import { ROUTER } from "@/http/http.tokens";
import { AUTH_SERVICE, OAUTH_SERVICE, AUTH_PROVIDER_REPOSITORY } from "@/modules/auth/auth.tokens";
import { AuthProviderDao } from "@/modules/auth/dao/AuthProviderDao";
import { AuthServiceImpl } from "@/modules/auth/service/impl/AuthServiceImpl";
import { OAuthServiceImpl } from "@/modules/auth/service/impl/OAuthServiceImpl";
import { AuthRouter } from "@/modules/auth/rest/AuthRouter";

/** Wires the auth module: provider repo -> DAO, service ports -> impls, and its router. */
export class AuthModule implements IModule {
	public register(container: DependencyContainer): void {
		container.registerSingleton(AUTH_PROVIDER_REPOSITORY, AuthProviderDao);
		container.registerSingleton(AUTH_SERVICE, AuthServiceImpl);
		container.registerSingleton(OAUTH_SERVICE, OAuthServiceImpl);
		container.registerSingleton(ROUTER, AuthRouter);
	}
}
