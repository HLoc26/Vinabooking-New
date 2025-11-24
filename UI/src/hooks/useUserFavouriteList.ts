import { useState, useEffect } from "react";
import type { FavouriteList } from "../types/FavouriteList";
import favouriteApi from "../services/favouriteApi";
import { usePushNotificationContext } from "../context/PushNotification/hook";
import { AxiosError, type AxiosResponse } from "axios";
import type { ApiResponse } from "../types/Response";
import useUserContextProvider from "../context/UserContext/hook";

const useUserFavouriteList = () => {
	const { userInfo } = useUserContextProvider();

	const userId = userInfo?.id;

	const [favouriteLists, setFavouriteList] = useState<FavouriteList[]>([]);
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

	// ---------------- Add / Remove Single Accommodation ----------------
	const handleAddToFavourite = async (favouriteId: string, accommodationId: string) => {
		if (!favouriteLists) return;

		setFavouriteList((prev) => prev?.map((f) => (f.id === favouriteId ? { ...f, items: [...f.items, { id: "", accommodationId }] } : f)) || null);

		try {
			const added = await favouriteApi.addAccommodation(favouriteId, accommodationId);
			if (!added) throw new Error("Error while adding accommodation");

			setFavouriteList(
				(prev) =>
					prev?.map((f) =>
						f.id === favouriteId
							? {
									...f,
									items: f.items.map((item) => (item.accommodationId === accommodationId && item.id === "" ? { ...item, id: added.id } : item)),
								}
							: f
					) || null
			);
		} catch (err) {
			console.error("Failed to add accommodation:", err);
			// rollback
			setFavouriteList((prev) => prev?.map((f) => (f.id === favouriteId ? { ...f, items: f.items.filter((i) => i.accommodationId !== accommodationId || i.id !== "") } : f)) || null);
		}
	};

	const handleRemoveFromFavourite = async (favouriteId: string, accommodationId: string) => {
		if (!favouriteLists) return;

		const list = favouriteLists.find((f) => f.id === favouriteId);
		if (!list) return;

		const prevItems = list.items;

		setFavouriteList((prev) => prev?.map((f) => (f.id === favouriteId ? { ...f, items: f.items.filter((i) => i.accommodationId !== accommodationId) } : f)) || null);

		try {
			await favouriteApi.removeAccommodation(favouriteId, accommodationId);
		} catch (err) {
			console.error("Failed to remove accommodation:", err);
			// rollback
			setFavouriteList((prev) => prev?.map((f) => (f.id === favouriteId ? { ...f, items: prevItems } : f)) || null);
		}
	};

	// ---------------- Create / Delete Favourite List ----------------
	const handleCreateFavouriteList = async (name: string) => {
		setLoading(true);
		if (!favouriteLists) return;

		const tempId = `temp-${Date.now()}`;
		const tempList: FavouriteList = { id: tempId, name, items: [], createdAt: new Date(), updatedAt: new Date() };
		setFavouriteList((prev) => (prev ? [...prev, tempList] : [tempList]));

		try {
			const created = await favouriteApi.createFavouriteList(name);
			if (!created?.id) throw new Error("Create failed");

			setFavouriteList((prev) => prev?.map((f) => (f.id === tempId ? { ...f, id: created.id } : f)) || null);
			pushNotification("Success", "success");
		} catch (err) {
			console.error("Failed to create list:", err);
			setFavouriteList((prev) => prev?.filter((f) => f.id !== tempId) || null);
			if (err instanceof AxiosError) {
				pushNotification((err.response as AxiosResponse<ApiResponse<FavouriteList>>)?.data.error ?? "Error while creating favourite list", "error");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleDeleteFavouriteList = async (listId: string) => {
		if (!favouriteLists) return;

		setLoading(true);
		try {
			await favouriteApi.deleteFavouriteList(listId);
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

	return {
		favouriteLists,
		loading,
		handleAddToFavourite,
		handleRemoveFromFavourite,
		handleCreateFavouriteList,
		handleDeleteFavouriteList,
	};
};

export default useUserFavouriteList;
