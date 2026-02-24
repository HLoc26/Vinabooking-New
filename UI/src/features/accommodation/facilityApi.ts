import apiClient from "../../services/apiClient";
import type { Facility } from "../../types/Accommodation";
import type { ApiResponse } from "../../types/Response";

export const getFacilities = () => apiClient.get<ApiResponse<Facility[]>>("/facilities").then((r) => r.data);
