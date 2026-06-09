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

    public static toJson(domain: Accommodation): string {
        const payload = {
            id: domain.getId(),
            name: domain.getName(),
            description: domain.getDescription(),
            type: domain.getType(),
            rentalType: domain.getRentalType(),
            status: domain.getStatus(),
            ownerId: domain.getOwnerId(),
            dynamicPricingSettings: domain.getDynamicPricingSettings(),
            createdAt: domain.getCreatedAt().toISOString(),
            updatedAt: domain.getUpdatedAt().toISOString(),
            address: domain.getAddress() ? {
                id: domain.getAddress()!.getId(),
                street: domain.getAddress()!.getStreet(),
                city: domain.getAddress()!.getCity(),
                country: domain.getAddress()!.getCountry(),
                countryCode: domain.getAddress()!.getCountryCode(),
                postalCode: domain.getAddress()!.getPostalCode(),
                latitude: domain.getAddress()!.getLatitude(),
                longitude: domain.getAddress()!.getLongitude(),
                fullAddress: domain.getAddress()!.getFullAddress(),
                placeId: domain.getAddress()!.getPlaceId(),
                createdAt: domain.getAddress()!.getCreatedAt().toISOString(),
                updatedAt: domain.getAddress()!.getUpdatedAt().toISOString()
            } : null,
            facilities: domain.getFacilities().map(f => ({
                id: f.getId(),
                fee: f.getFee(),
                note: f.getNote(),
                isAvailable: f.getIsAvailable(),
                createdAt: f.getCreatedAt().toISOString(),
                updatedAt: f.getUpdatedAt().toISOString(),
                facility: {
                    id: f.getFacility().getId(),
                    name: f.getFacility().getName(),
                    type: f.getFacility().getType(),
                    description: f.getFacility().getDescription(),
                    createdAt: f.getFacility().getCreatedAt().toISOString(),
                    updatedAt: f.getFacility().getUpdatedAt().toISOString()
                }
            })),
            holidayOptIns: domain.getHolidayOptIns().map(h => ({
                id: h.getId(),
                accommodationId: h.getAccommodationId(),
                holidayCode: h.getHolidayCode(),
                priceMultiplier: h.getPriceMultiplier(),
                preDays: h.getPreDays(),
                postDays: h.getPostDays(),
                enabled: h.getEnabled()
            })),
            roomCount: (domain as any).roomCount || 0,
            allRoomsValid: (domain as any).allRoomsValid || false
        };
        return JSON.stringify(payload);
    }

    public static fromJson(jsonStr: string): Accommodation {
        const parsed = JSON.parse(jsonStr);

        let address: Address | null = null;
        if (parsed.address) {
            address = Address.builder()
                .setId(parsed.address.id)
                .setStreet(parsed.address.street)
                .setCity(parsed.address.city)
                .setCountry(parsed.address.country)
                .setCountryCode(parsed.address.countryCode)
                .setPostalCode(parsed.address.postalCode)
                .setLatitude(parsed.address.latitude)
                .setLongitude(parsed.address.longitude)
                .setFullAddress(parsed.address.fullAddress)
                .setPlaceId(parsed.address.placeId)
                .setCreatedAt(new Date(parsed.address.createdAt))
                .setUpdatedAt(new Date(parsed.address.updatedAt))
                .build();
        }

        const facilities = (parsed.facilities || []).map((fc: any) => {
            const facilityDomain = new Facility(
                fc.facility.id,
                fc.facility.name,
                fc.facility.type as any,
                fc.facility.description,
                new Date(fc.facility.createdAt),
                new Date(fc.facility.updatedAt)
            );
            return FacilityConfig.builder()
                .setId(fc.id)
                .setFee(fc.fee)
                .setNote(fc.note)
                .setIsAvailable(fc.isAvailable)
                .setCreatedAt(new Date(fc.createdAt))
                .setUpdatedAt(new Date(fc.updatedAt))
                .setFacility(facilityDomain)
                .build();
        });

        const holidays = (parsed.holidayOptIns || []).map((h: any) => {
            return AccommodationHoliday.builder()
                .setId(h.id)
                .setAccommodationId(h.accommodationId)
                .setHolidayCode(h.holidayCode)
                .setPriceMultiplier(h.priceMultiplier)
                .setPreDays(h.preDays)
                .setPostDays(h.postDays)
                .setEnabled(h.enabled)
                .build();
        });

        return Accommodation.builder()
            .setId(parsed.id)
            .setName(parsed.name)
            .setDescription(parsed.description)
            .setType(parsed.type)
            .setRentalType(parsed.rentalType)
            .setStatus(parsed.status)
            .setOwnerId(parsed.ownerId)
            .setDynamicPricingSettings(parsed.dynamicPricingSettings)
            .setCreatedAt(new Date(parsed.createdAt))
            .setUpdatedAt(new Date(parsed.updatedAt))
            .setAddress(address)
            .setFacilities(facilities)
            .setHolidayOptIns(holidays)
            .setRoomValidationInfo(parsed.roomCount, parsed.allRoomsValid)
            .build();
    }
}
