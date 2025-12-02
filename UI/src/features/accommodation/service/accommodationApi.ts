import apiClient from "../../../services/apiClient";
import type { Facility } from "../../../types/Accommodation";
import type { ApiResponse } from "../../../types/Response";

const accommodationApi = {
	getAccommodationById: (id: string, checkIn?: string, checkOut?: string) => {
		const params: Record<string, string> = {};

		if (checkIn) params.checkIn = checkIn;
		if (checkOut) params.checkOut = checkOut;

		return apiClient.get(`/accommodations/${id}`, { params }).then((r) => r);
	},

	getFacilities: () => apiClient.get<ApiResponse<Facility[]>>("/accommodations/facilities").then((r) => r.data),
};

export default accommodationApi;
