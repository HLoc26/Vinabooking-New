import { FavouriteItem, FavouriteList } from "@/models/favourite";
import { FavouriteItem as PrismaFavouriteItem, FavouriteList as PrismaFavouriteList } from "@/generated/client";

type PrismaFavouriteListWithItems = PrismaFavouriteList & { items?: PrismaFavouriteItem[] };

class FavouriteMapper {
	public static toDomainList(prismaList: PrismaFavouriteListWithItems): FavouriteList {
		const builder = FavouriteList.builder()
			.setId(prismaList.id)
			.setName(prismaList.name)
			.setOwnerId(prismaList.ownerId)
			.setCreatedAt(prismaList.createdAt)
			.setUpdatedAt(prismaList.updatedAt);

		if (prismaList.items) {
			const items = prismaList.items.map((item) => this.toDomainItem(item));
			builder.setItems(items);
		}

		return builder.build();
	}

	public static toDomainItem(prismaItem: PrismaFavouriteItem): FavouriteItem {
		return FavouriteItem.builder()
			.setId(prismaItem.id)
			.setListId(prismaItem.listId)
			.setAccommodationId(prismaItem.accommodationId)
			.build();
	}

	public static toPersistenceList(domainList: FavouriteList): PrismaFavouriteList {
		return {
			id: domainList.getId(),
			name: domainList.getName(),
			ownerId: domainList.getOwnerId(),
			createdAt: domainList.getCreatedAt(),
			updatedAt: domainList.getUpdatedAt(),
		};
	}

	public static toPersistenceItem(domainItem: FavouriteItem): PrismaFavouriteItem {
		return {
			id: domainItem.getId(),
			listId: domainItem.getListId(),
			accommodationId: domainItem.getAccommodationId(),
		};
	}
}

export default FavouriteMapper;
