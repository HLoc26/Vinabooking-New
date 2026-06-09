import type { DependencyContainer } from "@/di/container";
import type { IModule } from "@/di/IModule";
import { ROUTER } from "@/http/http.tokens";
import { ROOM_SERVICE, ROOM_REPOSITORY } from "@/modules/room/room.tokens";
import { RoomDao } from "@/modules/room/dao/RoomDao";
import { RoomServiceImpl } from "@/modules/room/service/impl/RoomServiceImpl";
import { RoomRouter } from "@/modules/room/rest/RoomRouter";

/** Wires the room module: repository port -> DAO, service port -> impl, and its router. */
export class RoomModule implements IModule {
	public register(container: DependencyContainer): void {
		container.registerSingleton(ROOM_REPOSITORY, RoomDao);
		container.registerSingleton(ROOM_SERVICE, RoomServiceImpl);
		container.registerSingleton(ROUTER, RoomRouter);
	}
}
