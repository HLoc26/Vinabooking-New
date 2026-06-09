import { injectable } from "tsyringe";
import { BaseRouter } from "@/http/BaseRouter";
import { RoomController } from "@/modules/room/rest/RoomController";
import { AuthGuard } from "@/http/middleware/AuthGuard";
import { ValidationPipe } from "@/http/middleware/ValidationPipe";
import { CreateRoomRequest } from "@/modules/room/dto/request/CreateRoomRequest";
import { UpdateRoomRequest } from "@/modules/room/dto/request/UpdateRoomRequest";

@injectable()
export class RoomRouter extends BaseRouter {
	constructor(
		private readonly controller: RoomController,
		private readonly auth: AuthGuard,
		private readonly validate: ValidationPipe
	) {
		super();
		this.registerRoutes();
	}

	public get basePath(): string {
		return "/rooms";
	}

	protected registerRoutes(): void {
		// Specific GETs first so they win over the `/:id` catch-all.
		this.router.get("/filter-ids", this.controller.getFilteredAccommodationIds);
		this.router.get("/accommodation/:accommodationId", this.controller.getRoomsByAccommodationId);

		// Owner-mutating: create a room under an accommodation the caller owns.
		this.router.post("/accommodation/:accommodationId", this.auth.handle, this.validate.body(CreateRoomRequest), this.controller.createRoom);

		// Owner-mutating: update / delete a single room.
		this.router.patch("/:id", this.auth.handle, this.validate.body(UpdateRoomRequest), this.controller.updateRoom);
		this.router.delete("/:id", this.auth.handle, this.controller.deleteRoom);

		// Public reads.
		this.router.get("/:id", this.controller.getRoomById);
		this.router.get("/", this.controller.getRoomsByMultipleIds);
	}
}
