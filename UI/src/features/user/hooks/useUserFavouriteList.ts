import { useState, useEffect } from "react";
import type { FavouriteList } from "../types/FavouriteList";
import favouriteApi from "../services/favouriteApi";

const useUserFavouriteList = (userId: string) => {
	const [favouriteLists, setFavouriteList] = useState<FavouriteList[] | null>(null);

	useEffect(() => {
		(async () => {
			if (!userId) return;

			const res = await favouriteApi.getUserFavourite(userId);
			if (!res?.favourites) {
				throw new Error("Favourite List not found");
			}

			setFavouriteList(res.favourites);
		})();
	}, [userId]);

	// ---------------- Optimistic Add ----------------
	const handleAddToFavourite = async (favouriteId: string, accommodationId: string) => {
		if (!favouriteLists) return;

		// Update UI immediately
		setFavouriteList((prev) => prev?.map((f) => (f.id === favouriteId ? { ...f, items: [...f.items, { id: "", accommodationId }] } : f)) || null);

		try {
			const added = await favouriteApi.addAccommodation(favouriteId, accommodationId);
			if (!added) throw new Error("Error while adding accommodation to favourite");

			setFavouriteList((prev) => {
				const updatedLists = prev?.map((f) => {
					if (f.id !== favouriteId) return f;

					const updatedItems = f.items.map((item) => {
						const shouldUpdate = item.accommodationId === accommodationId && item.id === "";
						return shouldUpdate ? { ...item, id: added.id } : item;
					});

					return { ...f, items: updatedItems };
				});

				return updatedLists || null;
			});
		} catch (err) {
			console.error("Failed to add accommodation:", err);

			setFavouriteList((prev) => {
				const updatedLists = prev?.map((f) => {
					if (f.id !== favouriteId) return f;
					const filteredItems = f.items.filter((i) => i.accommodationId !== accommodationId || i.id !== "");
					return { ...f, items: filteredItems };
				});

				return updatedLists || null;
			});
		}
	};

	// ---------------- Optimistic Remove ----------------
	const handleRemoveFromFavourite = async (favouriteId: string, accommodationId: string) => {
		if (!favouriteLists) return;

		const list = favouriteLists.find((f) => f.id === favouriteId);
		if (!list) return;

		const prevItems = list.items;

		// Update UI immediately
		const newLists = favouriteLists.map((f) => (f.id === favouriteId ? { ...f, items: f.items.filter((i) => i.accommodationId !== accommodationId) } : f));
		setFavouriteList(newLists);

		try {
			await favouriteApi.removeAccommodation(favouriteId, accommodationId);
		} catch (err) {
			console.error("Failed to remove accommodation:", err);
			// Rollback if error
			setFavouriteList(favouriteLists.map((f) => (f.id === favouriteId ? { ...f, items: prevItems } : f)));
		}
	};

	return { favouriteLists, handleAddToFavourite, handleRemoveFromFavourite };
};

export default useUserFavouriteList;
