import apiClient from "../../../services/apiClient";
import type { ApiResponse } from "../../../types/Response";
import type { Booking } from "../types/Booking";

const bookingApi = {
	getByUserId: (userId: string) => apiClient.get<ApiResponse<Booking[]>>("/bookings", { params: { entity: "user", id: userId } }).then((r) => r.data),
	getById: (bookingId: string) => apiClient.get<ApiResponse<Booking>>("/bookings", { params: { entity: "id", id: bookingId } }).then((r) => r.data),
	cancel: (bookingId: string) => apiClient.patch(`/bookings?id=${bookingId}`).then((r) => r.data),
};

export default bookingApi;
