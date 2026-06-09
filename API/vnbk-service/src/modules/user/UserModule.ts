import type { DependencyContainer } from "@/di/container";
import type { IModule } from "@/di/IModule";
import { ROUTER } from "@/http/http.tokens";
import { USER_SERVICE, USER_REPOSITORY } from "@/modules/user/user.tokens";
import { UserDao } from "@/modules/user/dao/UserDao";
import { UserServiceImpl } from "@/modules/user/service/impl/UserServiceImpl";
import { UserRouter } from "@/modules/user/rest/UserRouter";

/** Wires the user module: repository port -> DAO, service port -> impl, and its router. */
export class UserModule implements IModule {
	public register(container: DependencyContainer): void {
		container.registerSingleton(USER_REPOSITORY, UserDao);
		container.registerSingleton(USER_SERVICE, UserServiceImpl);
		container.registerSingleton(ROUTER, UserRouter);
	}
}
