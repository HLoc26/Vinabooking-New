import apiClient from "../../../services/apiClient";

const roomApi = {
	getById: (roomId: string) => apiClient.get(`/rooms/${roomId}`).then((r) => r.data),
};

export default roomApi;
