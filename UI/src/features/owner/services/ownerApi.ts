import apiClient from "../../../services/apiClient";
import type { ApiResponse } from "../../../types/Response";
import type { UserDto } from "../../user/types/UserDto";
import type { UpgradeOwnerPayload, OwnerProfileData, OwnerAccommodationCard } from "../types/owner.types";

export const getOwnerInfo = async () => apiClient.get<ApiResponse<OwnerProfileData>>("/owners/profile/me").then((res) => res.data.data);

export const upgradeToOwner = async (info: UpgradeOwnerPayload) => apiClient.post<ApiResponse<UserDto>>("/owners/upgrade", info).then((res) => res.data.data);

export const getOwnerAccommodations = async () => apiClient.get<ApiResponse<OwnerAccommodationCard[]>>("/owners/accommodations").then((res) => res.data.data);
