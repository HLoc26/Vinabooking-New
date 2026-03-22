import apiClient from "../../../services/apiClient";
import type { ApiResponse } from "../../../types/Response";
import type { DraftAccommodation } from "../../accommodation/types/accommodation.types";
import type { UserDto } from "../../user/types/UserDto";
import type { UpgradeOwnerPayload, OwnerProfileData } from "../types/owner.types";

export const getOwnerInfo = async () => apiClient.get<ApiResponse<OwnerProfileData>>("/owners/profile/me").then((res) => res.data.data);

export const upgradeToOwner = async (info: UpgradeOwnerPayload) => apiClient.post<ApiResponse<UserDto>>("/owners/upgrade", info).then((res) => res.data.data);

export const getDraftAccommodations = async (): Promise<ApiResponse<DraftAccommodation[]>> => {
	const response = await apiClient.get<ApiResponse<DraftAccommodation[]>>("/owners/accommodations/drafts");
	return response.data;
};
