import apiClient from "../../services/apiClient";
import type { ApiResponse } from "../../types/Response";
import type { RoomFullDetail } from "./types/room.types";

export const getRoomByAccommodationId = (accommodationId: string, startDate?: Date, endDate?: Date) =>
	apiClient
		.get<ApiResponse<RoomFullDetail[]>>(`/rooms/accommodation/${accommodationId}`, {
			params: { startDate, endDate },
		})
		.then((res) => res.data);
