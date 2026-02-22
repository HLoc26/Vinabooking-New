import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import type { RootState } from "../app/store";
import type { FavouriteList } from "../types/FavouriteList";
import favouriteApi from "../services/favouriteApi";
import { usePushNotificationContext } from "../context/PushNotification/hook";
import { AxiosError, type AxiosResponse } from "axios";
import type { ApiResponse } from "../types/Response";

const useUserFavouriteList = () => {
	const userFromRedux = useSelector((state: RootState) => state.auth.user);
	const userId = userFromRedux?.id;

	const queryClient = useQueryClient();
	const { pushNotification } = usePushNotificationContext();

	const [actionLoading, setActionLoading] = useState<boolean>(false);

	const { data: favouriteLists = [], isLoading: isFetching } = useQuery({
		queryKey: ["favouriteLists", userId],
		queryFn: async () => {
			if (!userId) return [];
			const res = await favouriteApi.getUserFavourite(userId);
			if (!res?.favourites) throw new Error("Favourite List not found");
			return res.favourites;
		},
		enabled: !!userId,
		staleTime: 1000 * 60 * 5,
		refetchOnWindowFocus: false,
	});

	const loading = isFetching || actionLoading;

	const setFavouriteCache = (updater: (old: FavouriteList[] | undefined) => FavouriteList[]) => {
		queryClient.setQueryData<FavouriteList[]>(["favouriteLists", userId], updater);
	};

	// --- Helper functions để giảm nested levels ---
	const addAccommodationToItems = (items: FavouriteList["items"], accommodationId: string, itemId: string = "") => {
		return [...items, { id: itemId, accommodationId }];
	};

	const updateItemIdInItems = (items: FavouriteList["items"], accommodationId: string, newItemId: string) => {
		return items.map((item) => (item.accommodationId === accommodationId && item.id === "" ? { ...item, id: newItemId } : item));
	};

	const removeAccommodationFromItems = (items: FavouriteList["items"], accommodationId: string, removeEmptyIdOnly: boolean = false) => {
		return items.filter((i) => {
			if (removeEmptyIdOnly) {
				return i.accommodationId !== accommodationId || i.id !== "";
			}
			return i.accommodationId !== accommodationId;
		});
	};
	// ---------------------------------------------

	// ---------------- Add / Remove Single Accommodation ----------------
	const handleAddToFavourite = async (favouriteId: string, accommodationId: string) => {
		setFavouriteCache((prev) => {
			if (!prev) return [];
			return prev.map((list) => {
				if (list.id !== favouriteId) return list;
				return { ...list, items: addAccommodationToItems(list.items, accommodationId) };
			});
		});

		try {
			const added = await favouriteApi.addAccommodation(favouriteId, accommodationId);
			if (!added) throw new Error("Error while adding accommodation");

			setFavouriteCache((prev) => {
				if (!prev) return [];
				return prev.map((list) => {
					if (list.id !== favouriteId) return list;
					return { ...list, items: updateItemIdInItems(list.items, accommodationId, added.id) };
				});
			});
		} catch (err) {
			console.error("Failed to add accommodation:", err);
			// rollback
			setFavouriteCache((prev) => {
				if (!prev) return [];
				return prev.map((list) => {
					if (list.id !== favouriteId) return list;
					return { ...list, items: removeAccommodationFromItems(list.items, accommodationId, true) };
				});
			});
		}
	};

	const handleRemoveFromFavourite = async (favouriteId: string, accommodationId: string) => {
		const targetList = favouriteLists.find((f) => f.id === favouriteId);
		if (!targetList) return;
		const prevItems = targetList.items;

		setFavouriteCache((prev) => {
			if (!prev) return [];
			return prev.map((list) => {
				if (list.id !== favouriteId) return list;
				return { ...list, items: removeAccommodationFromItems(list.items, accommodationId) };
			});
		});

		try {
			await favouriteApi.removeAccommodation(favouriteId, accommodationId);
		} catch (err) {
			console.error("Failed to remove accommodation:", err);
			// rollback
			setFavouriteCache((prev) => {
				if (!prev) return [];
				return prev.map((list) => {
					if (list.id !== favouriteId) return list;
					return { ...list, items: prevItems };
				});
			});
		}
	};

	// ---------------- Create / Delete Favourite List ----------------
	const handleCreateFavouriteList = async (name: string) => {
		setActionLoading(true);
		const tempId = `temp-${Date.now()}`;
		const tempList: FavouriteList = { id: tempId, name, items: [], createdAt: new Date(), updatedAt: new Date() };

		setFavouriteCache((prev) => (prev ? [...prev, tempList] : [tempList]));

		try {
			const created = await favouriteApi.createFavouriteList(name);
			if (!created?.id) throw new Error("Create failed");

			setFavouriteCache((prev) => prev?.map((f) => (f.id === tempId ? { ...f, id: created.id } : f)) || []);
			pushNotification("Success", "success");
		} catch (err) {
			console.error("Failed to create list:", err);
			setFavouriteCache((prev) => prev?.filter((f) => f.id !== tempId) || []);
			if (err instanceof AxiosError) {
				pushNotification((err.response as AxiosResponse<ApiResponse<FavouriteList>>)?.data.error ?? "Error while creating favourite list", "error");
			}
		} finally {
			setActionLoading(false);
		}
	};

	const handleDeleteFavouriteList = async (listId: string) => {
		setActionLoading(true);
		try {
			await favouriteApi.deleteFavouriteList(listId);
			setFavouriteCache((prev) => prev?.filter((f) => f.id !== listId) || []);
			pushNotification("Favourite list deleted successfully", "success");
		} catch (err) {
			console.error("Failed to delete favourite list:", err);
			if (err instanceof AxiosError) {
				pushNotification((err.response as AxiosResponse<ApiResponse<FavouriteList>>)?.data.error ?? "Error while deleting favourite list", "error");
			} else {
				pushNotification("Error while deleting favourite list", "error");
			}
		} finally {
			setActionLoading(false);
		}
	};

	const handleUpdateFavouriteList = async (listId: string, name: string) => {
		const originalLists = favouriteLists;

		setFavouriteCache((prev) => prev?.map((list) => (list.id === listId ? { ...list, name } : list)) || []);

		try {
			await favouriteApi.updateFavouriteList(listId, name);
			pushNotification("Favourite list updated successfully", "success");
		} catch (err) {
			console.error("Failed to update favourite list:", err);
			setFavouriteCache(() => originalLists);
			if (err instanceof AxiosError) {
				pushNotification((err.response as AxiosResponse<ApiResponse<FavouriteList>>)?.data.error ?? "Error while updating favourite list", "error");
			} else {
				pushNotification("Error while updating favourite list", "error");
			}
		}
	};

	return {
		favouriteLists,
		loading,
		handleAddToFavourite,
		handleRemoveFromFavourite,
		handleCreateFavouriteList,
		handleDeleteFavouriteList,
		handleUpdateFavouriteList,
	};
};

export default useUserFavouriteList;
