import { Prisma, EAccommodationType, ERentalType, EAccommodationStatus } from "@/generated/client";
import { Accommodation } from "@/models/accommodation/accommodation.model";
import { Address } from "@/models/accommodation/address.model";
import { FacilityConfig } from "@/models/accommodation/facility-config.model";
import { AccommodationHoliday } from "@/models/accommodation/accommodation-holiday.model";
import { Facility } from "@/models/facility";
import { DynamicPricingSettings } from "@/types/pricing.types";

// The full payload we expect from Prisma when retrieving an Accommodation to map to domain
type AccommodationEntity = Prisma.AccommodationGetPayload<{
    include: {
        address: true;
        facilities: {
            include: {
                facility: true;
            };
        };
        holidayOptIns: true;
        // Optionally rooms for validation if included
        rooms?: {
            select: { id: true; basePrice: true; floorPrice: true; quantity: true; beds: { select: { id: true } } }
        };
        _count?: {
            select: { rooms: true };
        }
    };
}>;

export class AccommodationMapper {
    public static toDomain(entity: AccommodationEntity): Accommodation {
        let address: Address | null = null;
        if (entity.address) {
            address = Address.builder()
                .setId(entity.address.id)
                .setStreet(entity.address.street)
                .setCity(entity.address.city)
                .setCountry(entity.address.country)
                .setCountryCode(entity.address.countryCode)
                .setPostalCode(entity.address.postalCode)
                .setLatitude(entity.address.latitude ? Number(entity.address.latitude) : null)
                .setLongitude(entity.address.longitude ? Number(entity.address.longitude) : null)
                .setFullAddress(entity.address.fullAddress)
                .setPlaceId(entity.address.placeId)
                .setCreatedAt(entity.address.createdAt)
                .setUpdatedAt(entity.address.updatedAt)
                .build();
        }

        const facilities = entity.facilities.map(fc => {
            const facilityDomain = new Facility(
                fc.facility.id,
                fc.facility.name,
                fc.facility.type as any,
                fc.facility.description,
                fc.facility.createdAt,
                fc.facility.updatedAt
            );
            return FacilityConfig.builder()
                .setId(fc.id)
                .setFee(fc.fee ? Number(fc.fee) : 0)
                .setNote(fc.note)
                .setIsAvailable(fc.isAvailable)
                .setCreatedAt(fc.createdAt)
                .setUpdatedAt(fc.updatedAt)
                .setFacility(facilityDomain)
                .build();
        });

        const holidays = (entity.holidayOptIns || []).map(h => 
            AccommodationHoliday.builder()
                .setId(h.id)
                .setAccommodationId(h.accommodationId)
                .setHolidayCode(h.holidayCode)
                .setPriceMultiplier(Number(h.priceMultiplier))
                .setPreDays(h.preDays)
                .setPostDays(h.postDays)
                .setEnabled(h.enabled)
                .build()
        );

        let roomCount = 0;
        let allRoomsValid = false;
        
        if (entity.rooms) {
            roomCount = entity.rooms.length;
            allRoomsValid = entity.rooms.every(room => {
                const basePrice = Number(room.basePrice);
                const floorPrice = Number(room.floorPrice);
                return basePrice > 0 && floorPrice <= basePrice && room.quantity > 0 && (room as any).beds?.length > 0;
            });
        } else if (entity._count && entity._count.rooms !== undefined) {
            roomCount = entity._count.rooms;
            // Without room details, we assume valid if we don't have them but need them for publishing? 
            // In a pure approach, if we need to publish, we must fetch the rooms.
            // For now, if we only count, we can't be sure they are valid.
        }

        return Accommodation.builder()
            .setId(entity.id)
            .setName(entity.name)
            .setDescription(entity.description)
            .setType(entity.type)
            .setRentalType(entity.rentalType)
            .setStatus(entity.status)
            .setOwnerId(entity.ownerId)
            .setDynamicPricingSettings(entity.dynamicPricingSettings as DynamicPricingSettings | null)
            .setCreatedAt(entity.createdAt)
            .setUpdatedAt(entity.updatedAt)
            .setAddress(address)
            .setFacilities(facilities)
            .setHolidayOptIns(holidays)
            .setRoomValidationInfo(roomCount, allRoomsValid)
            .build();
    }

    public static toPersistence(domain: Accommodation): any {
        return {
            id: domain.getId(),
            name: domain.getName(),
            description: domain.getDescription(),
            type: domain.getType(),
            rentalType: domain.getRentalType(),
            status: domain.getStatus(),
            ownerId: domain.getOwnerId(),
            dynamicPricingSettings: domain.getDynamicPricingSettings() ? (domain.getDynamicPricingSettings() as any) : Prisma.JsonNull,
            createdAt: domain.getCreatedAt(),
            updatedAt: domain.getUpdatedAt()
        };
    }

    public static toAddressPersistence(domain: Address): any {
        return {
            id: domain.getId(),
            street: domain.getStreet(),
            city: domain.getCity(),
            country: domain.getCountry(),
            countryCode: domain.getCountryCode(),
            postalCode: domain.getPostalCode(),
            latitude: domain.getLatitude(),
            longitude: domain.getLongitude(),
            fullAddress: domain.getFullAddress(),
            placeId: domain.getPlaceId(),
            createdAt: domain.getCreatedAt(),
            updatedAt: domain.getUpdatedAt()
        };
    }
}
