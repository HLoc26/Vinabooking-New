import apiClient from "../../../services/apiClient";

const accommodationApi = {
	getAccommodationById: (id: string) => apiClient.get(`/accommodations/${id}`).then((r) => r),
};

export default accommodationApi;
