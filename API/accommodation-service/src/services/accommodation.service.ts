import { accommodationRepository } from "../repositories/accommodation.repository";
import { NotFoundError } from "../errors";
//import { UserClient, RoomClient, ImageClient, ReviewClient } from "../clients";
import { roomClient } from "../clients/room.client";
import { imageClient } from "../clients/image.client";

export class AccommodationService {
    async getAccommodationById(id: string) {
        console.log(
            `[AccommodationService] Fetching details for accomm ID: ${id}`
        );

        // 1. Create 3 Promises to run in parallel
        const accommodationPromise = accommodationRepository.findById(id);
        const roomsPromise = roomClient.getRoomsByAccommodationId(id);
        const imagesPromise = imageClient.getImagesForEntity(id);

        // 2. Await all Promises
        const [accommodation, rooms, images] = await Promise.all([
            accommodationPromise,
            roomsPromise,
            imagesPromise,
        ]);

        // 3. Check if accommodation exists
        if (!accommodation) {
            throw new NotFoundError(`Accommodation with ID ${id} not found`);
        }

        // 4. Combine data and return
        return {
            ...accommodation,
            rooms: rooms,
            images: images,
        };
    }

    /**
     * Gets Accommodation details by a Room ID.
     */
    async getAccommodationByRoomId(roomId: string) {
        console.log(
            `[AccommodationService] Finding accommodation for room ID: ${roomId}`
        );
        // 1. Call Room Service Client to get the Accommodation ID
        const accommodationId =
            await roomClient.getAccommodationIdByRoomId(roomId);
        console.log(
            `[AccommodationService] Found accommodation ID: ${accommodationId} for room ID: ${roomId}`
        );

        // 2. Use the existing getAccommodationById to fetch details (which includes fetching rooms again)
        const accommodationDetails =
            await this.getAccommodationById(accommodationId);

        return accommodationDetails;
    }
}

// Singleton instance
export const accommodationService = new AccommodationService();
