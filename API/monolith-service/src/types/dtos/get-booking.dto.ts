import { Prisma } from "@/generated/browser";

export type BookingWithDetails = Prisma.BookingGetPayload<{
	include: {
		details: true;
	};
}>;
