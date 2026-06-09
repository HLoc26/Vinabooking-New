import type { DependencyContainer } from "@/di/container";
import type { IModule } from "@/di/IModule";
import { ROUTER } from "@/http/http.tokens";
import { PRICING_SERVICE, OWNER_PRICING_SERVICE, PRICING_REPOSITORY } from "@/modules/pricing/pricing.tokens";
import { PricingDao } from "@/modules/pricing/dao/PricingDao";
import { PricingServiceImpl } from "@/modules/pricing/service/impl/PricingServiceImpl";
import { OwnerPricingServiceImpl } from "@/modules/pricing/service/impl/OwnerPricingServiceImpl";
import { PricingRouter } from "@/modules/pricing/rest/PricingRouter";

/** Wires the pricing module: repository port -> DAO, service ports -> impls, and its router. */
export class PricingModule implements IModule {
	public register(container: DependencyContainer): void {
		container.registerSingleton(PRICING_REPOSITORY, PricingDao);
		container.registerSingleton(PRICING_SERVICE, PricingServiceImpl);
		container.registerSingleton(OWNER_PRICING_SERVICE, OwnerPricingServiceImpl);
		container.registerSingleton(ROUTER, PricingRouter);
	}
}
