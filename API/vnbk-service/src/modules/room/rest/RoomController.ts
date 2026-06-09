import { inject, injectable } from "tsyringe";
import type { Request } from "express";
import { BaseController } from "@/http/BaseController";
import { ROOM_SERVICE } from "@/modules/room/room.tokens";
import type { IRoomService, PriceWindow } from "@/modules/room/service/IRoomService";
import { RoomDtoMapper } from "@/modules/room/rest/mapper/RoomDtoMapper";
import type { CreateRoomRequest } from "@/modules/room/dto/request/CreateRoomRequest";
import type { UpdateRoomRequest } from "@/modules/room/dto/request/UpdateRoomRequest";
import type { RoomResponse } from "@/modules/room/dto/response/RoomResponse";
import type { RoomFilterOptions } from "@/modules/room/repository/IRoomRepository";
import { BadRequestError } from "@/shared/error/BadRequestError";

@injectable()
export class RoomController extends BaseController {
	constructor(
		@inject(ROOM_SERVICE) private readonly roomService: IRoomService,
		private readonly mapper: RoomDtoMapper
	) {
		super();
	}

	// --- Internal filter API (search support) ---

	public getFilteredAccommodationIds = this.handle<string[]>(async (req: Request) => {
		const { minPrice, maxPrice, adults, children, sortBy } = req.query;
		const filters: RoomFilterOptions = {
			minPrice: this.toNumber(minPrice),
			maxPrice: this.toNumber(maxPrice),
			adults: this.toNumber(adults),
			children: this.toNumber(children),
			sortBy: typeof sortBy === "string" ? sortBy : undefined,
		};
		const ids = await this.roomService.filterAccommodationIds(filters);
		return this.ok(ids);
	});

	// --- Room reads ---

	public getRoomsByAccommodationId = this.handle<RoomResponse[]>(async (req: Request) => {
		const accommodationId = this.param(req, "accommodationId");
		const window = this.parseWindow(req.query.startDate, req.query.endDate);
		const rooms = await this.roomService.getRoomsByAccommodationId(accommodationId, window);
		return this.ok(rooms);
	});

	public getRoomById = this.handle<RoomResponse>(async (req: Request) => {
		const id = this.param(req, "id");
		const window = this.parseWindow(req.query.checkIn, req.query.checkOut);
		const room = await this.roomService.getRoomById(id, window);
		return this.ok(room);
	});

	public getRoomsByMultipleIds = this.handle<RoomResponse[]>(async (req: Request) => {
		const id = req.query.id;
		if (!id || typeof id !== "string") return this.ok([]);
		const ids = id
			.split(",")
			.map((i) => i.trim())
			.filter((i) => i.length > 0);
		if (ids.length === 0) return this.ok([]);
		const rooms = await this.roomService.getRoomsByMultipleIds(ids);
		return this.ok(rooms);
	});

	// --- Owner mutations ---

	public createRoom = this.handle<RoomResponse>(async (req: Request) => {
		const ownerId = this.requireUserId(req);
		const accommodationId = this.param(req, "accommodationId");
		const dto = req.validatedBody as CreateRoomRequest;
		const room = await this.roomService.createRoom(ownerId, accommodationId, dto);
		return this.created(this.mapper.toResponse(room));
	});

	public updateRoom = this.handle<RoomResponse>(async (req: Request) => {
		const ownerId = this.requireUserId(req);
		const id = this.param(req, "id");
		const dto = req.validatedBody as UpdateRoomRequest;
		const room = await this.roomService.updateRoom(ownerId, id, dto);
		return this.ok(this.mapper.toResponse(room));
	});

	public deleteRoom = this.handle<null>(async (req: Request) => {
		const ownerId = this.requireUserId(req);
		const id = this.param(req, "id");
		await this.roomService.deleteRoom(ownerId, id);
		return this.ok(null);
	});

	// --- Helpers ---

	/** Reads a required path param as a single string, or throws 400. */
	private param(req: Request, name: string): string {
		const value = req.params[name];
		if (typeof value !== "string" || value.length === 0) {
			throw new BadRequestError(`Missing ${name} parameter`);
		}
		return value;
	}

	private parseWindow(start: unknown, end: unknown): PriceWindow | undefined {
		if (typeof start !== "string" || typeof end !== "string") return undefined;
		const checkIn = new Date(start);
		const checkOut = new Date(end);
		if (Number.isNaN(checkIn.getTime()) || Number.isNaN(checkOut.getTime())) return undefined;
		return { checkIn, checkOut };
	}

	private toNumber(value: unknown): number | undefined {
		if (typeof value !== "string" || value.trim() === "") return undefined;
		const parsed = Number(value);
		return Number.isNaN(parsed) ? undefined : parsed;
	}
}
