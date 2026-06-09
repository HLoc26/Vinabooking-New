export interface FavouriteItemDto {
    id: string;
    listId: string;
    accommodationId: string;
    createdAt: Date;
}

export interface FavouriteListDto {
    id: string;
    name: string;
    ownerId: string;
    createdAt: Date;
    updatedAt: Date;
    items?: FavouriteItemDto[];
}
