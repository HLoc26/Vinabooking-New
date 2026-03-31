import apiClient from "../../../services/apiClient";
import type { ApiResponse } from "../../../types/Response";
import type { DraftAccommodation } from "../../accommodation/types/accommodation.types";
import type { UserDto } from "../../user/types/UserDto";
import type {
	UpgradeOwnerPayload,
	OwnerProfileData,
	OwnerAccommodationCard,
	DashboardStats,
	FacilityDto,
	AmenityDto,
	CreateAccommodationPayload,
	AccommodationSummary,
	UpdateAccommodationPayload,
	UpdateAddressPayload,
} from "../types/owner.types";

export const getOwnerInfo = async () => apiClient.get<ApiResponse<OwnerProfileData>>("/owners/profile/me").then((res) => res.data.data);

export const upgradeToOwner = async (info: UpgradeOwnerPayload) => apiClient.post<ApiResponse<UserDto>>("/owners/upgrade", info).then((res) => res.data.data);

export const getOwnerAccommodations = async () => apiClient.get<ApiResponse<OwnerAccommodationCard[]>>("/owners/accommodations").then((res) => res.data.data);

export const getDashboardStats = async () => apiClient.get<ApiResponse<DashboardStats>>("/owners/dashboard/stats").then((res) => res.data.data);

export const getDraftAccommodations = async (): Promise<ApiResponse<DraftAccommodation[]>> => {
	const response = await apiClient.get<ApiResponse<DraftAccommodation[]>>("/owners/accommodations/drafts");
	return response.data;
};

export const getOwnerAmenities = async () => apiClient.get<ApiResponse<AmenityDto[]>>("/amenities").then((data) => data.data);

export const getOwnerFacilities = async () => apiClient.get<ApiResponse<FacilityDto[]>>("/facilities").then((data) => data.data);

// ─── Step 2: Basic info ───────────────────────────────────────────────────────
// POST /owners/accommodations → returns the new accommodation with its id
export const createAccommodation = async (payload: CreateAccommodationPayload): Promise<AccommodationSummary> =>
	apiClient.post<ApiResponse<AccommodationSummary>>("/owners/accommodations", payload).then((res) => {
		const { success, data, error } = res.data;
		if (!success || !data) {
			throw new Error(error || "Failed to create accommodation");
		}
		return data;
	});
//PATCH /accom/:id để cập nhật basic info
export const updateAccommodation = async (id: string, payload: UpdateAccommodationPayload): Promise<AccommodationSummary> =>
	apiClient.patch<ApiResponse<AccommodationSummary>>(`/owners/accommodations/${id}`, payload).then((res) => {
		const { success, data, error } = res.data;
		if (!success || !data) {
			throw new Error(error || "Failed to update accommodation");
		}
		return data;
	});
//GET thông tin accom để lấy
export const getBasicInfo = async (id: string): Promise<AccommodationSummary> =>
	apiClient.get<ApiResponse<AccommodationSummary>>(`/accommodations/${id}`).then((res) => {
		const { success, data, error } = res.data;
		if (!success || !data) throw new Error(error || "Failed to fetch accommodation");
		return data;
	});
// // ─── Step 3: Address ──────────────────────────────────────────────────────────

export const updateAccommodationAddress = async (accommodationId: string, payload: UpdateAddressPayload): Promise<void> =>
	apiClient.put(`/owners/accommodations/${accommodationId}/address`, payload).then(() => undefined);

// // ─── Step 4: Facilities ───────────────────────────────────────────────────────

// export const updateAccommodationFacilities = async (accommodationId: string, payload: UpdateFacilitiesPayload): Promise<void> =>
// 	apiClient.put(`/owners/accommodations/${accommodationId}/facilities`, payload).then(() => undefined);

// // ─── Step 5: Rooms ────────────────────────────────────────────────────────────

// export const createRoom = async (accommodationId: string, payload: CreateRoomPayload): Promise<{ id: string }> =>
// 	apiClient.post<ApiResponse<{ id: string }>>(`/owners/accommodations/${accommodationId}/rooms`, payload).then((res) => res.data.data);

// export const updateRoom = async (
// 	roomId: string,
// 	payload: CreateRoomPayload // same shape — backend does full replacement
// ): Promise<void> => apiClient.patch(`/owners/rooms/${roomId}`, payload).then(() => undefined);

// // ─── Step 6: Images ───────────────────────────────────────────────────────────
// // Max 10 files per request. Use uploadAccommodationImages/uploadRoomImages
// // which handle chunking automatically.

// const CHUNK_SIZE = 10;

// const uploadChunk = (url: string, files: File[]): Promise<void> => {
// 	const formData = new FormData();
// 	files.forEach((file) => formData.append("files", file));
// 	return apiClient
// 		.post(url, formData, {
// 			headers: { "Content-Type": "multipart/form-data" },
// 		})
// 		.then(() => undefined);
// };

// // Splits files into chunks of 10 and fires sequential requests.
// const uploadInChunks = async (url: string, files: File[]): Promise<void> => {
// 	for (let i = 0; i < files.length; i += CHUNK_SIZE) {
// 		await uploadChunk(url, files.slice(i, i + CHUNK_SIZE));
// 	}
// };

// export const uploadAccommodationImages = (accommodationId: string, files: File[]): Promise<void> => uploadInChunks(`/images/accommodation/${accommodationId}`, files);

// export const uploadRoomImages = (roomId: string, files: File[]): Promise<void> => uploadInChunks(`/images/room/${roomId}`, files);

// // ─── Lookups ──────────────────────────────────────────────────────────────────

// export const getAmenities = async (): Promise<AmenityDto[]> => apiClient.get<ApiResponse<AmenityDto[]>>("/amenities").then((res) => res.data.data);

// export const getFacilities = async (): Promise<FacilityDto[]> => apiClient.get<ApiResponse<FacilityDto[]>>("/facilities").then((res) => res.data.data);
