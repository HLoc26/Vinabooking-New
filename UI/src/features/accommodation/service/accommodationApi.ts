import apiClient from "../../../services/apiClient";
import type { Facility } from "../../../types/Accommodation";
import type { ApiResponse } from "../../../types/Response";

const accommodationApi = {
	getAccommodationById: (id: string) => apiClient.get(`/accommodations/${id}`).then((r) => r),
	getFacilities: () => apiClient.get<ApiResponse<Facility[]>>("/accommodations/facilities").then((r) => r.data),
};

export default accommodationApi;
