import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createRoom, updateRoom } from "../services/ownerApi";
import type { UpdateRoomDTO, RoomSummary } from "../types/owner.types";

// ─── useCreateRoom ────────────────────────────────────────────────────────────

export const useCreateRoom = (accommodationId: string) => {
	const queryClient = useQueryClient();

	return useMutation<RoomSummary, Error, UpdateRoomDTO>({
		mutationFn: (payload) => createRoom(accommodationId, payload),

		onSuccess: (data) => {
			queryClient.setQueryData(["accommodation", accommodationId, "rooms"], (old: RoomSummary[] | undefined) => [...(old ?? []), data]);
			queryClient.invalidateQueries({ queryKey: ["accommodationManage", accommodationId] });
		},

		onError: (err) => {
			console.error("Create room failed:", err.message);
		},
	});
};

// ─── useUpdateRoom ────────────────────────────────────────────────────────────

export const useUpdateRoom = (accommodationId: string, roomId: string) => {
	const queryClient = useQueryClient();

	return useMutation<RoomSummary, Error, UpdateRoomDTO>({
		mutationFn: (payload) => updateRoom(roomId, payload),

		onSuccess: (data) => {
			queryClient.setQueryData(["accommodation", accommodationId, "rooms"], (old: RoomSummary[] | undefined) => (old ?? []).map((r) => (r.id === data.id ? data : r)));
			queryClient.invalidateQueries({ queryKey: ["accommodationManage", accommodationId] });
		},

		onError: (err) => {
			console.error("Update room failed:", err.message);
		},
	});
};
