import { accommodationRepository } from "../repositories/accommodation.repository";
import { NotFoundError } from "../errors";
//import { AccommodationDetailDto } from '../types/accommodation';
//import { UserClient, RoomClient, ImageClient, ReviewClient } from "../clients";
import { roomClient } from "../clients/room.client";

export class AccommodationService {
    async getAccommodationById(id: string) {
        // 1. Get accommodation from repository
        const accommodation = await accommodationRepository.findById(id);

        if (!accommodation) {
            throw new NotFoundError(`Accommodation with ID ${id} not found`);
        }

        // 2. Call API from Room Service to get room list
        let rooms = [];
        // const roomServiceUrl = `${config.roomEndpoint}/accommodation/${id}`;
        try {
            console.log(
                `[AccommodationService] Fetching rooms from RoomClient for accomm ID: ${id}`
            );
            rooms = await roomClient.getRoomsByAccommodationId(id);
        } catch (error) {
            console.error(
                `[AccommodationService] Error fetching rooms for accomm ID ${id}:`,
                error
            );
        }

        // 3. Combine data and return
        return {
            ...accommodation,
            rooms: rooms,
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

    // Nghiên cứu sau
    // async getDetail(id: string) {
    //     const accommodation = await this.repo.findById(id);
    //     if (!accommodation) throw new NotFoundError("Accommodation not found");

    //     const [owner, rooms, images, reviews] = await Promise.all([
    //         this.userClient.getById(accommodation.ownerId),
    //         this.roomClient.getByAccommodation(id),
    //         this.imageClient.getByAccommodation(id),
    //         this.reviewClient.getByAccommodation(id),
    //     ]);

    //     const result = {
    //         ...accommodation,
    //         owner,
    //         rooms,
    //         images,
    //         reviews,
    //         facilities:
    //             accommodation.facilities?.map((f) => ({
    //                 name: f.facility.name,
    //                 type: f.facility.type,
    //                 fee: f.fee,
    //                 note: f.note,
    //             })) ?? [],
    //     };

    //     return AccommodationDetailDto.parse(result);
    // }
}

// Singleton instance
export const accommodationService = new AccommodationService();
