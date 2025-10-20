import { accommodationRepository } from "../repositories/accommodation.repository";
//import { AccommodationDetailDto } from '../types/accommodation';
//import { UserClient, RoomClient, ImageClient, ReviewClient } from "../clients";

export class AccommodationService {
    async getAccommodationById(id: string) {
        const accommodation = await accommodationRepository.findById(id);

        if (!accommodation) {
            throw new Error("Accommodation not found");
        }

        return accommodation;
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
