import apiClient from "../../../services/apiClient";
import type { ApiResponse } from "../../../types/Response";
import type { Image } from "../types/Image";

const userApi = {
	getUserAvatar: (userId: string) => apiClient.get<ApiResponse<{ images: Image[] }>>(`/images/profile/${userId}`).then((r) => r.data),
};

export default userApi;
