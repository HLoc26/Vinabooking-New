import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import type { FavouriteList } from "../types/FavouriteList";
import favouriteApi from "../services/favouriteApi";
import { usePushNotificationContext } from "../../../context/PushNotification/hook";
import { AxiosError, type AxiosResponse } from "axios";
import type { ApiResponse } from "../../../types/Response";

const useUserFavouriteList = () => {
	const userFromRedux = useSelector((state: RootState) => state.auth.user);
	const userId = userFromRedux?.id;

	const queryClient = useQueryClient();
	const { pushNotification } = usePushNotificationContext();
	const queryKey = ["favouriteLists", userId];

	// --- Query ---
	const { data: favouriteLists = [], isFetching } = useQuery({
		queryKey,
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

	// --- Helper functions for Cache updates ---
	const addAccommodationToItems = (items: FavouriteList["items"], accommodationId: string, itemId: string = "") => {
		return [...items, { id: itemId, accommodationId }];
	};

	const updateItemIdInItems = (items: FavouriteList["items"], accommodationId: string, newItemId: string) => {
		return items.map((item) => (item.accommodationId === accommodationId && item.id === "" ? { ...item, id: newItemId } : item));
	};

	const removeAccommodationFromItems = (items: FavouriteList["items"], accommodationId: string) => {
		return items.filter((i) => i.accommodationId !== accommodationId);
	};

	const handleErrorNotification = (err: unknown, fallbackMessage: string) => {
		if (err instanceof AxiosError) {
			pushNotification((err.response as AxiosResponse<ApiResponse<FavouriteList>>)?.data.error ?? fallbackMessage, "error");
		} else {
			pushNotification(fallbackMessage, "error");
		}
	};

	// --- Mutations ---

	// 1. Add Accommodation
	const addMutation = useMutation({
		mutationFn: ({ favouriteId, accommodationId }: { favouriteId: string; accommodationId: string }) => favouriteApi.addAccommodation(favouriteId, accommodationId),
		onMutate: async ({ favouriteId, accommodationId }) => {
			await queryClient.cancelQueries({ queryKey });
			const previousLists = queryClient.getQueryData<FavouriteList[]>(queryKey);

			queryClient.setQueryData<FavouriteList[]>(queryKey, (old) => {
				if (!old) return [];
				return old.map((list) => (list.id === favouriteId ? { ...list, items: addAccommodationToItems(list.items, accommodationId) } : list));
			});
			return { previousLists };
		},
		onError: (err, variables, context) => {
			console.error("Failed to add accommodation:", err);
			if (context?.previousLists) queryClient.setQueryData(queryKey, context.previousLists);
		},
		onSuccess: (added, { favouriteId, accommodationId }) => {
			if (!added) return;
			queryClient.setQueryData<FavouriteList[]>(queryKey, (old) => {
				if (!old) return [];
				return old.map((list) => (list.id === favouriteId ? { ...list, items: updateItemIdInItems(list.items, accommodationId, added.id) } : list));
			});
		},
		onSettled: () => queryClient.invalidateQueries({ queryKey }),
	});

	// 2. Remove Accommodation
	const removeMutation = useMutation({
		mutationFn: ({ favouriteId, accommodationId }: { favouriteId: string; accommodationId: string }) => favouriteApi.removeAccommodation(favouriteId, accommodationId),
		onMutate: async ({ favouriteId, accommodationId }) => {
			await queryClient.cancelQueries({ queryKey });
			const previousLists = queryClient.getQueryData<FavouriteList[]>(queryKey);

			queryClient.setQueryData<FavouriteList[]>(queryKey, (old) => {
				if (!old) return [];
				return old.map((list) => (list.id === favouriteId ? { ...list, items: removeAccommodationFromItems(list.items, accommodationId) } : list));
			});
			return { previousLists };
		},
		onError: (err, variables, context) => {
			console.error("Failed to remove accommodation:", err);
			if (context?.previousLists) queryClient.setQueryData(queryKey, context.previousLists);
		},
		onSettled: () => queryClient.invalidateQueries({ queryKey }),
	});

	// 3. Create List
	const createMutation = useMutation({
		mutationFn: (name: string) => favouriteApi.createFavouriteList(name),
		onMutate: async (name) => {
			await queryClient.cancelQueries({ queryKey });
			const previousLists = queryClient.getQueryData<FavouriteList[]>(queryKey);

			const tempId = `temp-${Date.now()}`;
			const tempList: FavouriteList = { id: tempId, name, items: [], createdAt: new Date(), updatedAt: new Date() };

			queryClient.setQueryData<FavouriteList[]>(queryKey, (old) => (old ? [...old, tempList] : [tempList]));
			return { previousLists, tempId };
		},
		onError: (err, variables, context) => {
			console.error("Failed to create list:", err);
			if (context?.previousLists) queryClient.setQueryData(queryKey, context.previousLists);
			handleErrorNotification(err, "Error while creating favourite list");
		},
		onSuccess: (created, variables, context) => {
			if (created?.id) {
				queryClient.setQueryData<FavouriteList[]>(queryKey, (old) => old?.map((f) => (f.id === context?.tempId ? { ...f, id: created.id } : f)) || []);
			}
			pushNotification("Success", "success");
		},
		onSettled: () => queryClient.invalidateQueries({ queryKey }),
	});

	// 4. Delete List
	const deleteMutation = useMutation({
		mutationFn: (listId: string) => favouriteApi.deleteFavouriteList(listId),
		onMutate: async (listId) => {
			await queryClient.cancelQueries({ queryKey });
			const previousLists = queryClient.getQueryData<FavouriteList[]>(queryKey);

			queryClient.setQueryData<FavouriteList[]>(queryKey, (old) => old?.filter((f) => f.id !== listId) || []);
			return { previousLists };
		},
		onError: (err, variables, context) => {
			console.error("Failed to delete favourite list:", err);
			if (context?.previousLists) queryClient.setQueryData(queryKey, context.previousLists);
			handleErrorNotification(err, "Error while deleting favourite list");
		},
		onSuccess: () => {
			pushNotification("Favourite list deleted successfully", "success");
		},
		onSettled: () => queryClient.invalidateQueries({ queryKey }),
	});

	// 5. Update List
	const updateMutation = useMutation({
		mutationFn: ({ listId, name }: { listId: string; name: string }) => favouriteApi.updateFavouriteList(listId, name),
		onMutate: async ({ listId, name }) => {
			await queryClient.cancelQueries({ queryKey });
			const previousLists = queryClient.getQueryData<FavouriteList[]>(queryKey);

			queryClient.setQueryData<FavouriteList[]>(queryKey, (old) => old?.map((list) => (list.id === listId ? { ...list, name } : list)) || []);
			return { previousLists };
		},
		onError: (err, variables, context) => {
			console.error("Failed to update favourite list:", err);
			if (context?.previousLists) queryClient.setQueryData(queryKey, context.previousLists);
			handleErrorNotification(err, "Error while updating favourite list");
		},
		onSuccess: () => {
			pushNotification("Favourite list updated successfully", "success");
		},
		onSettled: () => queryClient.invalidateQueries({ queryKey }),
	});

	// Aggregate loading state
	const loading = isFetching || addMutation.isPending || removeMutation.isPending || createMutation.isPending || deleteMutation.isPending || updateMutation.isPending;

	return {
		favouriteLists,
		loading,
		handleAddToFavourite: (favouriteId: string, accommodationId: string) => addMutation.mutate({ favouriteId, accommodationId }),
		handleRemoveFromFavourite: (favouriteId: string, accommodationId: string) => removeMutation.mutate({ favouriteId, accommodationId }),
		handleCreateFavouriteList: (name: string) => createMutation.mutate(name),
		handleDeleteFavouriteList: (listId: string) => deleteMutation.mutate(listId),
		handleUpdateFavouriteList: (listId: string, name: string) => updateMutation.mutate({ listId, name }),
	};
};

export default useUserFavouriteList;
