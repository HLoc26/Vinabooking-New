import apiClient from "../../../services/apiClient";
import type { ApiResponse } from "../../../types/Response";
import type { Accommodation } from "../types/Accommodation";

const accommodationApi = {
	getInfoById: (accommodationId: string) => apiClient.get<ApiResponse<Accommodation>>(`/accommodations/${accommodationId}`).then((r) => r.data),
	getByEntity: (entity: string, entityId: string) =>
		apiClient //
			.get(`/accommodations`, { params: { byEntity: entity, entityId } })
			.then((r) => r.data),
};

export default accommodationApi;
