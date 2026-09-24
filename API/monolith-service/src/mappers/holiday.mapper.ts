import { Holiday as PrismaHoliday } from "@/generated/client";
import { Holiday } from "@/models/holiday";

export class HolidayMapper {
    public static toDomain(prismaHoliday: PrismaHoliday): Holiday {
        return Holiday.builder()
            .setId(prismaHoliday.id)
            .setName(prismaHoliday.name)
            .setCode(prismaHoliday.code)
            .setDate(prismaHoliday.date)
            .setIsRecurring(prismaHoliday.isRecurring)
            .build();
    }

    public static toPersistence(domainHoliday: Holiday): Omit<PrismaHoliday, "id"> | PrismaHoliday {
        const persistenceModel = {
            name: domainHoliday.getName(),
            code: domainHoliday.getCode(),
            date: domainHoliday.getDate(),
            isRecurring: domainHoliday.getIsRecurring()
        };

        // If ID is 0, it means it's a new record that hasn't been persisted yet.
        // Prisma will handle autoincrementing the ID.
        if (domainHoliday.getId() !== 0) {
            return { ...persistenceModel, id: domainHoliday.getId() };
        }

        return persistenceModel;
    }
}
