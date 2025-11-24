import axios from "axios";
import type { AxiosInstance } from "axios";

import { API_CONFIG } from "../config/api.config";
import type { ApiResponse, AccommodationSearchData, SearchAccommodationParams, AccommodationDetail } from "../types/accommodation.types";

class AccommodationService {
	private api: AxiosInstance;

	constructor() {
		this.api = axios.create({
			baseURL: API_CONFIG.BASE_URL,
			timeout: API_CONFIG.TIMEOUT,
			headers: {
				"Content-Type": "application/json",
			},
		});
	}

	private buildQueryString(params: SearchAccommodationParams): string {
		const queryParams = new URLSearchParams();

		Object.entries(params).forEach(([key, value]) => {
			if (value === undefined || value === null || value === "") return;

			if (Array.isArray(value)) {
				value.forEach((item) => {
					queryParams.append(key, String(item));
				});
			} else {
				queryParams.append(key, String(value));
			}
		});

		const qs = queryParams.toString();
		return qs ? `?${qs}` : "";
	}

	async searchAccommodations(params: SearchAccommodationParams): Promise<ApiResponse<AccommodationSearchData>> {
		const queryString = this.buildQueryString(params);
		const url = `${API_CONFIG.ENDPOINTS.ACCOMMODATIONS.SEARCH}${queryString}`;

		try {
			const response = await this.api.get<ApiResponse<AccommodationSearchData>>(url);
			return response.data;
		} catch (error) {
			console.error("Search accommodations failed:", error);
			throw error;
		}
	}

	// Cái này để refactor trang detail sau
	async getAccommodationById(id: string): Promise<ApiResponse<AccommodationDetail>> {
		const url = `${API_CONFIG.ENDPOINTS.ACCOMMODATIONS.GET_BY_ID}/${id}`;

		try {
			const response = await this.api.get<ApiResponse<AccommodationDetail>>(url);
			return response.data;
		} catch (error) {
			console.error("Get accommodation by ID failed:", error);
			throw error;
		}
	}
}

export const accommodationService = new AccommodationService();
