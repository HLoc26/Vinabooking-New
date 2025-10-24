import { z } from "zod";
import {
    Accommodation,
    Address,
    FacilityConfig,
    Facility,
} from "@prisma/client";

// Interface cho entity (domain model) - extend Prisma types để add relations
export interface AccommodationEntity extends Accommodation {
    address?: Address | null;
    facilities?: (FacilityConfig & { facility: Facility })[];
}

// DTO cho response (aggregated) - full fields từ schema, với aggregated data
export const AccommodationDetailDto = z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().optional(),
    type: z.enum([
        "HOTEL",
        "APARTMENT",
        "VILLA",
        "VACATION_HOME",
        "GUESTHOUSE",
        "HOSTEL",
        "BED_AND_BREAKFAST",
        "HOMESTAY",
        "CAMPGROUND",
        "COUNTRY_HOUSE",
        "BOAT",
        "LUXURY_TENT",
        "CABIN",
        "MOTEL",
        "RESORT",
        "FARMSTAY",
        "CAPSULE_HOTEL",
        "TREEHOUSE",
        "TOWNHOUSE",
        "OTHER",
    ]),
    rentalType: z
        .enum(["ENTIRE_PLACE", "PRIVATE_ROOM", "SHARED_ROOM"])
        .optional(),
    isActive: z.boolean(),
    ownerId: z.string(), // Luôn có từ schema, nhưng owner full optional từ user-service
    owner: z
        .object({
            id: z.string(),
            name: z.string().optional(), // Có thể add more fields từ user-service nếu cần
        })
        .optional(),
    address: z
        .object({
            id: z.string(),
            street: z.string(),
            ward: z.string().optional(),
            district: z.string().optional(),
            city: z.string(),
            country: z.string(),
            countryCode: z.string(),
            postalCode: z.string().optional(),
            latitude: z.number().optional(), // Decimal in schema, nhưng Zod dùng number
            longitude: z.number().optional(),
            fullAddress: z.string(),
            placeId: z.string().optional(),
            createdAt: z.date(),
            updatedAt: z.date(),
        })
        .optional(),
    facilities: z.array(
        z.object({
            id: z.string(),
            fee: z.number().optional(),
            note: z.string().optional(),
            isAvailable: z.boolean(),
            createdAt: z.date(),
            updatedAt: z.date(),
            name: z.string(), // Từ facility
            type: z.enum([
                "GENERAL",
                "FOOD_AND_DRINK",
                "PUBLIC_FACILITIES",
                "SERVICES",
                "SAFETY",
                "ACCESSIBILITY",
                "ENTERTAINMENT",
                "OUTDOOR",
                "TRANSPORTATION",
                "WELLNESS",
                "SPECIAL_AMENITIES",
                "SUSTAINABILITY",
                "OTHER",
            ]),
            description: z.string().optional(), // Từ facility
        })
    ),
    rooms: z
        .array(
            z.object({
                id: z.string(),
                name: z.string(), // Có thể add more từ room-service
            })
        )
        .optional(),
    images: z.array(z.string() /* URLs from image-service */).optional(),
    reviews: z
        .array(
            z.object({
                rating: z.number(),
                comment: z.string(), // Có thể add more từ review-service
            })
        )
        .optional(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export type AccommodationDetailType = z.infer<typeof AccommodationDetailDto>;
