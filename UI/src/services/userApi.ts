import apiClient from "../services/apiClient";
import type { ApiResponse } from "../types/Response";
import type { Image } from "../types/Image";
import type { UserDto } from "../types/UserDto";

const userApi = {
	getMe: () => apiClient.get<ApiResponse<UserDto>>("/user/me").then((r) => r.data),
	getUserAvatar: (userId: string) => apiClient.get<ApiResponse<Image[]>>(`/images/profile/${userId}`).then((r) => r.data),
	updateUser: (userId: string, data: { name?: string; phone?: string }) => apiClient.patch<ApiResponse<UserDto>>(`/users/${userId}`, data).then((r) => r.data),
	uploadAvatar: (userId: string, file: File) => {
		const formData = new FormData();
		formData.append("files", file);

		return apiClient
			.post<ApiResponse<{ success: boolean; images: Image[] }>>(`/images/profile/${userId}`, formData, {
				headers: { "Content-Type": "multipart/form-data" },
			})
			.then((r) => r.data);
	},
};

export default userApi;
