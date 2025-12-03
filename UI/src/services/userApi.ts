import apiClient from "../services/apiClient";
import type { ApiResponse } from "../types/Response";
import type { Image } from "../types/Image";
import type { UserDto } from "../types/UserDto";

const userApi = {
	getUserAvatar: (userId: string) => apiClient.get<ApiResponse<{ images: Image[] }>>(`/images/profile/${userId}`).then((r) => r.data),
	updateUser: (userId: string, data: { name?: string; phone?: string }) => apiClient.patch<ApiResponse<UserDto>>(`/users/${userId}`, data).then((r) => r.data),
};

export default userApi;
