import { Prisma } from "@/generated/browser";

export type UserWithFavourites = Prisma.UserGetPayload<{
	include: {
		favourites: {
			include: {
				items: true;
			};
		};
	};
}>;
