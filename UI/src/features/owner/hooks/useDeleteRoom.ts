import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteRoomApi } from "../services/ownerApi";
import type { RoomForm } from "../types/owner.types";

export const useDeleteRoom = (accommodationId: string) => {
	const queryClient = useQueryClient();

	return useMutation<void, Error, string>({
		mutationFn: (roomId) => deleteRoomApi(roomId),

		onSuccess: (_, roomId) => {
			// Update the cached room list for this accommodation
			queryClient.setQueryData(["accommodation", accommodationId, "rooms"], (old: RoomForm[] | undefined) => (old ?? []).filter((r) => r.id !== roomId));
		},

		onError: (err) => {
			console.error("Delete room failed:", err.message);
		},
	});
};
