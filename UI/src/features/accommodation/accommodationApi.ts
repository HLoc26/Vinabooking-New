import apiClient from "../../services/apiClient";
import type { ApiResponse } from "../../types/Response";
import type { AccommodationDetail } from "./types/accommodation.types";

export const getAccommodationById = (id: string) => apiClient.get<ApiResponse<AccommodationDetail>>(`/accommodations/${id}`).then((data) => data.data);
