import { inject, injectable } from "tsyringe";
import type { IRoomService, PriceWindow } from "@/modules/room/service/IRoomService";
import { ROOM_REPOSITORY } from "@/modules/room/room.tokens";
import type { IRoomRepository, RoomFilterOptions } from "@/modules/room/repository/IRoomRepository";
import type { Room } from "@/modules/room/domain/Room";
import type { RoomResponse } from "@/modules/room/dto/response/RoomResponse";
import type { CreateRoomRequest } from "@/modules/room/dto/request/CreateRoomRequest";
import type { UpdateRoomRequest } from "@/modules/room/dto/request/UpdateRoomRequest";
import { RoomDtoMapper } from "@/modules/room/rest/mapper/RoomDtoMapper";
import { NotFoundError } from "@/shared/error/NotFoundError";
import { BadRequestError } from "@/shared/error/BadRequestError";
import { IMAGE_SERVICE, EEntityType } from "@/modules/image";
import type { IImageService, ImageResponse } from "@/modules/image";
import { PRICING_SERVICE, EItemType } from "@/modules/pricing";
import type { IPricingService, QuoteItemPricingResponse } from "@/modules/pricing";

@injectable()
export class RoomServiceImpl implements IRoomService {
	constructor(
		@inject(ROOM_REPOSITORY) private readonly roomRepository: IRoomRepository,
		@inject(IMAGE_SERVICE) private readonly imageService: IImageService,
		@inject(PRICING_SERVICE) private readonly pricingService: IPricingService,
		private readonly mapper: RoomDtoMapper
	) {}

	public async getRoomById(roomId: string, window?: PriceWindow): Promise<RoomResponse> {
		const room = await this.roomRepository.findById(roomId);
		if (!room) throw new NotFoundError(`Room with ID ${roomId} not found`);

		const images = await this.loadImages(roomId);
		const pricing = window ? await this.previewSinglePrice(roomId, window) : undefined;
		return this.mapper.toResponse(room, { images, pricing });
	}

	public async getRoomsByMultipleIds(ids: string[]): Promise<RoomResponse[]> {
		const rooms = await this.roomRepository.findManyByIds(ids);
		if (rooms.length === 0) throw new NotFoundError("No rooms found");
		return this.enrichRooms(rooms);
	}

	public async getRoomsByAccommodationId(accommodationId: string, window?: PriceWindow): Promise<RoomResponse[]> {
		const rooms = await this.roomRepository.findAllByAccommodationId(accommodationId);
		if (rooms.length === 0) return [];
		const pricingMap = window ? await this.previewBatchPrices(rooms.map((r) => r.id), window) : new Map<string, QuoteItemPricingResponse>();
		return this.enrichRooms(rooms, pricingMap);
		// NOTE: availability moved to booking module — remainingQuantity (totalQuantity
		// minus booked count) is computed there, not here, to keep the graph acyclic.
	}

	public async createRoom(ownerId: string, accommodationId: string, request: CreateRoomRequest): Promise<Room> {
		const isOwner = await this.roomRepository.checkAccommodationOwnership(accommodationId, ownerId);
		if (!isOwner) throw new BadRequestError("Accommodation not found or unauthorized");

		this.assertFloorBelowBase(request.basePrice, request.floorPrice);
		return this.roomRepository.create(accommodationId, request);
	}

	public async updateRoom(ownerId: string, roomId: string, request: UpdateRoomRequest): Promise<Room> {
		const isOwner = await this.roomRepository.checkRoomOwnership(roomId, ownerId);
		if (!isOwner) throw new BadRequestError("Room not found or unauthorized");

		this.assertFloorBelowBase(request.basePrice, request.floorPrice);
		return this.roomRepository.update(roomId, request);
	}

	public async deleteRoom(ownerId: string, roomId: string): Promise<void> {
		const isOwner = await this.roomRepository.checkRoomOwnership(roomId, ownerId);
		if (!isOwner) throw new BadRequestError("Room not found or unauthorized");

		await this.roomRepository.delete(roomId);
		// Best-effort image cleanup: a storage hiccup must not fail the delete.
		try {
			await this.imageService.deleteImagesByEntity(EEntityType.ROOM, roomId);
		} catch (err) {
			console.error(`[RoomService] deleting images for room ${roomId} failed`, err);
		}
	}

	public async filterAccommodationIds(filters: RoomFilterOptions): Promise<string[]> {
		return this.roomRepository.findAccommodationIdsByFilter(filters);
	}

	// --- Helpers ---

	/** floorPrice must never exceed basePrice (mirrors the monolith controller guard). */
	private assertFloorBelowBase(basePrice?: number, floorPrice?: number): void {
		if (basePrice !== undefined && floorPrice !== undefined && Number(floorPrice) > Number(basePrice)) {
			throw new BadRequestError("floorPrice must be ≤ basePrice");
		}
	}

	/** Map domain rooms to enriched responses, attaching images (and optional pricing). */
	private async enrichRooms(rooms: Room[], pricingMap?: Map<string, QuoteItemPricingResponse>): Promise<RoomResponse[]> {
		const imagesMap = await this.loadImagesByRooms(rooms.map((r) => r.id));
		return rooms.map((room) =>
			this.mapper.toResponse(room, {
				images: imagesMap[room.id] ?? [],
				pricing: pricingMap?.get(room.id),
			})
		);
	}

	/** Best-effort: images for a single room (never fails the read). */
	private async loadImages(roomId: string): Promise<ImageResponse[]> {
		try {
			return await this.imageService.getImagesByEntity(EEntityType.ROOM, roomId);
		} catch (err) {
			console.error(`[RoomService] loading images for room ${roomId} failed`, err);
			return [];
		}
	}

	/** Best-effort: images for many rooms, grouped by room id (never fails the read). */
	private async loadImagesByRooms(roomIds: string[]): Promise<Record<string, ImageResponse[]>> {
		try {
			return await this.imageService.getImagesByEntities(EEntityType.ROOM, roomIds);
		} catch (err) {
			console.error("[RoomService] batch image load failed", err);
			return {};
		}
	}

	/** Best-effort single-room price preview via the pricing engine. */
	private async previewSinglePrice(roomId: string, window: PriceWindow): Promise<QuoteItemPricingResponse | undefined> {
		try {
			const quote = await this.pricingService.quote({
				checkIn: window.checkIn.toISOString(),
				checkOut: window.checkOut.toISOString(),
				items: [{ itemType: EItemType.ROOM, itemId: roomId, count: 1 }],
			});
			return quote.items[0]?.pricing;
		} catch (err) {
			console.error("[RoomService] pricing.quote failed", err);
			return undefined;
		}
	}

	/** Best-effort batch price preview; returns pricing keyed by room id. */
	private async previewBatchPrices(roomIds: string[], window: PriceWindow): Promise<Map<string, QuoteItemPricingResponse>> {
		const pricingMap = new Map<string, QuoteItemPricingResponse>();
		try {
			const quote = await this.pricingService.quote({
				checkIn: window.checkIn.toISOString(),
				checkOut: window.checkOut.toISOString(),
				items: roomIds.map((id) => ({ itemType: EItemType.ROOM, itemId: id, count: 1 })),
			});
			for (const item of quote.items) pricingMap.set(item.itemId, item.pricing);
		} catch (err) {
			console.error("[RoomService] batch pricing.quote failed", err);
		}
		return pricingMap;
	}
}
