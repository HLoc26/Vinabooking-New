import type { DependencyContainer } from "@/di/container";
import type { IModule } from "@/di/IModule";
import { ROUTER } from "@/http/http.tokens";
import { ACCOMMODATION_SERVICE, ACCOMMODATION_REPOSITORY } from "@/modules/accommodation/accommodation.tokens";
import { AccommodationDao } from "@/modules/accommodation/dao/AccommodationDao";
import { AccommodationServiceImpl } from "@/modules/accommodation/service/impl/AccommodationServiceImpl";
import { AccommodationRouter } from "@/modules/accommodation/rest/AccommodationRouter";

/** Wires the accommodation module: repository port -> DAO, service port -> impl, and its router. */
export class AccommodationModule implements IModule {
	public register(container: DependencyContainer): void {
		container.registerSingleton(ACCOMMODATION_REPOSITORY, AccommodationDao);
		container.registerSingleton(ACCOMMODATION_SERVICE, AccommodationServiceImpl);
		container.registerSingleton(ROUTER, AccommodationRouter);
	}
}
