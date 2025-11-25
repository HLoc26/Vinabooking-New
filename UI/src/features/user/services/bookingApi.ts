import apiClient from "../../../services/apiClient";
import type { ApiResponse } from "../../../types/Response";
import type { Booking } from "../types/Booking";

const bookingApi = {
	getByUserId: (userId: string) => apiClient.get<ApiResponse<Booking[]>>("/bookings", { params: { entity: "user", id: userId } }).then((r) => r.data),
};

export default bookingApi;
