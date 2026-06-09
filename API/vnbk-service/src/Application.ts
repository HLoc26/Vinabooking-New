import express from "express";
import type { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { appContainer } from "@/di/container";
import type { DependencyContainer } from "@/di/container";
import type { IModule } from "@/di/IModule";
import type { IRouter } from "@/http/IRouter";
import { ROUTER } from "@/http/http.tokens";
import { AppRouter } from "@/http/AppRouter";
import { AppConfig } from "@/config/AppConfig";
import { PrismaProvider } from "@/infrastructure/persistence/PrismaProvider";
import { ErrorHandlerMiddleware } from "@/http/middleware/ErrorHandlerMiddleware";
import { RequestLogger } from "@/http/middleware/RequestLogger";
import { InfrastructureModule } from "@/infrastructure/InfrastructureModule";
import { UserModule } from "@/modules/user/UserModule";
import { AuthModule } from "@/modules/auth/AuthModule";
import { PricingModule } from "@/modules/pricing/PricingModule";
import { ImageModule } from "@/modules/image/ImageModule";
import { RoomModule } from "@/modules/room/RoomModule";
import { AccommodationModule } from "@/modules/accommodation/AccommodationModule";
import { BookingModule } from "@/modules/booking/BookingModule";

/**
 * Composition root. Builds the DI container, registers every feature module,
 * connects infrastructure, wires Express, and starts the HTTP server.
 */
export class Application {
	private readonly container: DependencyContainer = appContainer;
	private readonly app: Express = express();

	/** Modules, in dependency order. Infrastructure first; feature modules added as built. */
	private get modules(): IModule[] {
		return [new InfrastructureModule(), new UserModule(), new AuthModule(), new PricingModule(), new ImageModule(), new RoomModule(), new AccommodationModule(), new BookingModule()];
	}

	public async bootstrap(): Promise<void> {
		const config = this.container.resolve(AppConfig);

		for (const module of this.modules) {
			module.register(this.container);
		}

		await this.connectInfrastructure();
		this.configureMiddleware();
		this.mountRoutes();
		this.app.use(ErrorHandlerMiddleware.handle);

		const port = config.getNumber("PORT", 8081);
		this.app.listen(port, () => {
			console.log(`[vnbk-service] Listening on port ${port}`);
		});
	}

	private async connectInfrastructure(): Promise<void> {
		try {
			const prisma = this.container.resolve(PrismaProvider);
			await prisma.connect();
			console.log("[vnbk-service] Database connected");
		} catch (err) {
			console.warn("[vnbk-service] Database connection unavailable (continuing):", (err as Error).message);
		}
	}

	private configureMiddleware(): void {
		const allowed = ["http://localhost:5173", "https://d3o4csdzy9h0t1.cloudfront.net"];
		this.app.use(
			cors({
				origin: (origin, callback) => {
					if (!origin || allowed.includes(origin)) {
						return callback(null, true);
					}
					return callback(new Error("Not allowed by CORS"));
				},
				credentials: true,
			})
		);
		this.app.use(cookieParser());
		this.app.use(express.json());
		this.app.use(RequestLogger.handle);
	}

	private mountRoutes(): void {
		const routers = this.container.isRegistered(ROUTER) ? this.container.resolveAll<IRouter>(ROUTER) : [];
		const appRouter = new AppRouter(routers);
		this.app.use(appRouter.router);
	}
}
