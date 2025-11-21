export type FavouriteListItem = {
	id: string;
	accommodationId: string;
};

export type FavouriteList = {
	id: string;
	items: FavouriteListItem[];
	name: string;
	createdAt: Date | string;
	updatedAt: Date | string;
};
