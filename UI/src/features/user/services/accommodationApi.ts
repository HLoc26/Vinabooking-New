import apiClient from "../../../services/apiClient";

const accommodationApi = {
	getInfoById: (accommodationId: string) => apiClient.get(`/accommodatinos/${accommodationId}`).then((r) => r.data),
	getByEntity: (entity: string, entityId: string) =>
		apiClient //
			.get(`/accommodations`, { params: { byEntity: entity, entityId } })
			.then((r) => r.data),
};

export default accommodationApi;
