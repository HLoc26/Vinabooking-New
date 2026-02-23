import AxiosInstance from "../../services/apiClient";
import { type ApiResponse } from "../../types/Response";
import type { UserDto } from "../../types/UserDto";
import type { UpdateUserInfoDto } from "./types";

export const fetchUserProfileApi = () => AxiosInstance.get<ApiResponse<UserDto>>("/user/me").then((r) => r.data.data);

export const updateUserProfileApi = (data: UpdateUserInfoDto) => AxiosInstance.patch<ApiResponse<UserDto>>(`/user/me`, data).then((r) => r.data.data);
