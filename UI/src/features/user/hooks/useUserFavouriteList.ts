import { useState, useEffect } from "react";
import type { FavouriteList } from "../types/FavouriteList";
import favouriteApi from "../services/favouriteApi";
import { usePushNotificationContext } from "../../../context/PushNotification/hook";
import { AxiosError, type AxiosResponse } from "axios";
import type { ApiResponse } from "../../../types/Response";

const useUserFavouriteList = (userId: string) => {
	const [favouriteLists, setFavouriteList] = useState<FavouriteList[] | null>(null);
	const [loading, setLoading] = useState<boolean>(false);
	const { pushNotification } = usePushNotificationContext();

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
	// ---------------- Add New Favourite List ----------------
	const handleCreateFavouriteList = async (name: string) => {
		setLoading(true);

		if (!favouriteLists) return;

		// Optimistic: add temp ID
		const tempId = `temp-${Date.now()}`;
		const tempList: FavouriteList = { id: tempId, name, items: [], createdAt: new Date(), updatedAt: new Date() };

		setFavouriteList((prev) => (prev ? [...prev, tempList] : [tempList]));

		try {
			const created = await favouriteApi.createFavouriteList(name);
			if (!created?.id) throw new Error("Create failed");

			// Update: replace id with realId
			setFavouriteList((prev) => prev?.map((f) => (f.id === tempId ? { ...f, id: created.id } : f)) || null);
			pushNotification("Success", "success");
		} catch (err) {
			console.error("Failed to create list:", err);

			// Rollback if error
			setFavouriteList((prev) => prev?.filter((f) => f.id !== tempId) || null);
			if (err instanceof AxiosError) {
				pushNotification((err.response as AxiosResponse<ApiResponse<FavouriteList>>).data.error ?? "Error while creating favourite list", "error");
			}
		} finally {
			setLoading(false);
		}
	};

	// ---------------- Delete Favourite List ----------------
	const handleDeleteFavouriteList = async (listId: string) => {
		if (!favouriteLists) return;

		setLoading(true);
		try {
			await favouriteApi.deleteFavouriteList(listId);

			// Cập nhật state sau khi API thành công
			setFavouriteList((prev) => prev?.filter((f) => f.id !== listId) || null);

			pushNotification("Favourite list deleted successfully", "success");
		} catch (err) {
			console.error("Failed to delete favourite list:", err);

			if (err instanceof AxiosError) {
				pushNotification((err.response as AxiosResponse<ApiResponse<FavouriteList>>)?.data.error ?? "Error while deleting favourite list", "error");
			} else {
				pushNotification("Error while deleting favourite list", "error");
			}
		} finally {
			setLoading(false);
		}
	};

	return { favouriteLists, loading, handleAddToFavourite, handleRemoveFromFavourite, handleCreateFavouriteList, handleDeleteFavouriteList };
};

export default useUserFavouriteList;
