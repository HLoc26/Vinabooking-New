import { OwnerProfile as PrismaOwnerProfile, OwnerHoliday as PrismaOwnerHoliday, Prisma } from "@/generated/client";
import { OwnerProfile, OwnerHoliday } from "@/models/owner";
import { DynamicPricingSettings } from "@/types/pricing.types";

export class OwnerMapper {
    public static toDomainProfile(
        prismaProfile: PrismaOwnerProfile & { ownerHolidays?: PrismaOwnerHoliday[] }
    ): OwnerProfile {
        const holidays = prismaProfile.ownerHolidays
            ? prismaProfile.ownerHolidays.map(h => this.toDomainHoliday(h))
            : [];

        const dynamicPricingSettings = prismaProfile.dynamicPricingSettings as DynamicPricingSettings | null;

        return OwnerProfile.builder()
            .setId(prismaProfile.id)
            .setUserId(prismaProfile.userId)
            .setBusinessName(prismaProfile.businessName)
            .setTaxId(prismaProfile.taxId)
            .setContactPhone(prismaProfile.contactPhone)
            .setIsVerified(prismaProfile.isVerified)
            .setDynamicPricingSettings(dynamicPricingSettings)
            .setCreatedAt(prismaProfile.createdAt)
            .setUpdatedAt(prismaProfile.updatedAt)
            .setOwnerHolidays(holidays)
            .build();
    }

    public static toDomainHoliday(prismaHoliday: PrismaOwnerHoliday): OwnerHoliday {
        return OwnerHoliday.builder()
            .setId(prismaHoliday.id)
            .setOwnerProfileId(prismaHoliday.ownerProfileId)
            .setHolidayCode(prismaHoliday.holidayCode)
            .setPriceMultiplier(Number(prismaHoliday.priceMultiplier))
            .setPreDays(prismaHoliday.preDays)
            .setPostDays(prismaHoliday.postDays)
            .setEnabled(prismaHoliday.enabled)
            .build();
    }

    public static toPersistenceProfile(domainProfile: OwnerProfile): Omit<PrismaOwnerProfile, "createdAt" | "updatedAt"> {
        return {
            id: domainProfile.getId(),
            userId: domainProfile.getUserId(),
            businessName: domainProfile.getBusinessName(),
            taxId: domainProfile.getTaxId(),
            contactPhone: domainProfile.getContactPhone(),
            isVerified: domainProfile.getIsVerified(),
            dynamicPricingSettings: (domainProfile.getDynamicPricingSettings() as any) ?? Prisma.JsonNull
        };
    }

    public static toResponseDto(domainProfile: OwnerProfile) {
        return {
            id: domainProfile.getId(),
            userId: domainProfile.getUserId(),
            businessName: domainProfile.getBusinessName(),
            taxId: domainProfile.getTaxId(),
            contactPhone: domainProfile.getContactPhone(),
            isVerified: domainProfile.getIsVerified(),
            createdAt: domainProfile.getCreatedAt(),
            updatedAt: domainProfile.getUpdatedAt(),
        };
    }

    public static toPersistenceHoliday(domainHoliday: OwnerHoliday): Omit<PrismaOwnerHoliday, "id"> {
        return {
            ownerProfileId: domainHoliday.getOwnerProfileId(),
            holidayCode: domainHoliday.getHolidayCode(),
            priceMultiplier: new Prisma.Decimal(domainHoliday.getPriceMultiplier()),
            preDays: domainHoliday.getPreDays(),
            postDays: domainHoliday.getPostDays(),
            enabled: domainHoliday.getEnabled()
        };
    }
}
