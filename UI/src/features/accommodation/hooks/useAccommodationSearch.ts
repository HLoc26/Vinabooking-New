import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useSearchParams as useRouterSearchParams } from "react-router-dom";

import { accommodationService } from "../services/accommodationService";
import type { AccommodationListItem, SearchAccommodationParams, SortOption } from "../types/accommodation.types";
import { ACCOMMODATION_TYPE_OPTIONS, FACILITY_FILTER_OPTIONS, PRICE_FILTER_CONFIG } from "../constants/searchFilters";
import type { ActiveFilter } from "../components/search";

// Helper functions (unchanged)
function formatDate(date: Date): string {
	return date.toISOString().split("T")[0];
}

function validateDates(checkIn: string, checkOut: string): string | null {
	if (!checkIn || !checkOut) return null;
	const today = new Date();
	today.setHours(0, 0, 0, 0);
	const inDate = new Date(checkIn);
	const outDate = new Date(checkOut);
	if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) return "Invalid date format.";
	if (inDate < today) return "Check-in date cannot be in the past.";
	if (outDate <= inDate) return "Check-out date must be after check-in date.";
	return null;
}

// Initial state creator
const getInitialState = (urlSearchParams: URLSearchParams) => {
	const today = new Date();
	const tomorrow = new Date(today);
	tomorrow.setDate(tomorrow.getDate() + 1);
	const after2Days = new Date(today);
	after2Days.setDate(after2Days.getDate() + 2);

	return {
		keyword: urlSearchParams.get("keyword") || "",
		checkIn: urlSearchParams.get("checkIn") || formatDate(tomorrow),
		checkOut: urlSearchParams.get("checkOut") || formatDate(after2Days),
		adults: parseInt(urlSearchParams.get("adults") || "2"),
		children: parseInt(urlSearchParams.get("children") || "0"),
		rooms: parseInt(urlSearchParams.get("rooms") || "1"),
		sortBy: (urlSearchParams.get("sortBy") as SortOption) || "recommended",
		page: parseInt(urlSearchParams.get("page") || "1"),
		type: urlSearchParams.get("type") || "",
		minPrice: parseInt(urlSearchParams.get("minPrice") || String(PRICE_FILTER_CONFIG.MIN)),
		maxPrice: parseInt(urlSearchParams.get("maxPrice") || String(PRICE_FILTER_CONFIG.MAX)),
		facilities: urlSearchParams.get("facilities")?.split(",") || [],
	};
};

export function useAccommodationSearch() {
	const navigate = useNavigate();
	const [urlSearchParams] = useRouterSearchParams();

	// Core State
	const [accommodations, setAccommodations] = useState<AccommodationListItem[]>([]);
	const [totalResults, setTotalResults] = useState<number>(0);
	const [totalPages, setTotalPages] = useState<number>(1);
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);

	// Search and Filter State
	const [searchState, setSearchState] = useState(() => getInitialState(urlSearchParams));
	const [isInitialLoad, setIsInitialLoad] = useState(true);

	// UI State
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [favorites, setFavorites] = useState<Set<string>>(new Set());

	// Memoized dependency strings for debouncing effect
	const searchStateString = useMemo(() => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		const { page, ...rest } = searchState; // Don't debounce on page change
		return JSON.stringify(rest);
	}, [searchState]);

	// Update URL whenever search state changes
	useEffect(() => {
		const params = new URLSearchParams();
		Object.entries(searchState).forEach(([key, value]) => {
			if (value !== undefined && value !== null && value !== "" && !(Array.isArray(value) && value.length === 0)) {
				if (key === "page" && value === 1) return; // Don't add page=1
				params.set(key, Array.isArray(value) ? value.join(",") : String(value));
			}
		});
		navigate(`/search?${params.toString()}`, { replace: true });
	}, [searchState, navigate]);

	// Fetch data logic
	const fetchAccommodations = useCallback(async () => {
		setLoading(true);
		setError(null);

		const dateError = validateDates(searchState.checkIn, searchState.checkOut);
		if (dateError) {
			setError(dateError);
			setLoading(false);
			return;
		}

		try {
			const apiParams: SearchAccommodationParams = {
				...searchState,
				limit: 20,
				keyword: searchState.keyword || undefined,
				type: searchState.type || undefined,
				facilities: searchState.facilities.length > 0 ? searchState.facilities : undefined,
			};
			const result = await accommodationService.searchAccommodations(apiParams);

			if (result.success) {
				setAccommodations(result.data.data);
				setTotalResults(result.data.meta.total);
				setTotalPages(result.data.meta.totalPages);
			} else {
				setError("Failed to load accommodations. Please try again.");
			}
		} catch (err) {
			console.error("❌ Error:", err);
			setError("An error occurred while loading accommodations. Please try again.");
		} finally {
			setLoading(false);
			if (!isInitialLoad) {
				window.scrollTo({ top: 0, behavior: "smooth" });
			}
		}
	}, [searchState, isInitialLoad]);

	// Effect for debouncing
	useEffect(() => {
		// Skip debounce on initial load, fetch immediately
		if (isInitialLoad) {
			fetchAccommodations();
			setIsInitialLoad(false);
			return;
		}

		const handler = setTimeout(() => {
			// When filters change, always go back to page 1
			setSearchState((prev) => (prev.page === 1 ? prev : { ...prev, page: 1 }));

			// If we are already on page 1, fetch immediately
			// otherwise, the page change effect will trigger the fetch
			if (searchState.page === 1) {
				fetchAccommodations();
			}
		}, 500); // 500ms debounce delay

		return () => {
			clearTimeout(handler);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchStateString]); // Re-run only when filters (not page) change

	// Effect for pagination
	useEffect(() => {
		// Do not fetch on initial load as the other effect handles it
		if (!isInitialLoad) {
			fetchAccommodations();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchState.page]); // Re-run only when page changes

	// Handlers
	const updateSearch = (patch: Partial<typeof searchState>) => {
		setSearchState((prev) => ({ ...prev, page: 1, ...patch }));
	};

	const setCurrentPage = (page: number) => {
		setSearchState((prev) => ({ ...prev, page }));
	};

	const handleFacilityChange = (value: string) => {
		updateSearch({
			facilities: searchState.facilities.includes(value) ? searchState.facilities.filter((f) => f !== value) : [...searchState.facilities, value],
		});
	};

	const handleClearAllFilters = () => {
		updateSearch({
			type: "",
			minPrice: PRICE_FILTER_CONFIG.MIN,
			maxPrice: PRICE_FILTER_CONFIG.MAX,
			facilities: [],
		});
	};

	const handleToggleFavorite = (id: string, e: React.MouseEvent) => {
		e.stopPropagation();
		setFavorites((prev) => {
			const next = new Set(prev);
			if (next.has(id)) next.delete(id);
			else next.add(id);
			return next;
		});
	};

	// Derived State: Active Filters
	const activeFilters: ActiveFilter[] = useMemo(() => {
		const filters: ActiveFilter[] = [];
		const { type, minPrice, maxPrice, facilities } = searchState;

		if (type) {
			const typeLabel = ACCOMMODATION_TYPE_OPTIONS.find((t) => t.value === type)?.label || type;
			filters.push({ key: "type", label: "Type", value: typeLabel });
		}

		if (minPrice > PRICE_FILTER_CONFIG.MIN || maxPrice < PRICE_FILTER_CONFIG.MAX) {
			filters.push({
				key: "price",
				label: "Price Range",
				value: `${formatPrice(minPrice)} - ${formatPrice(maxPrice)}`,
			});
		}

		facilities.forEach((facility) => {
			const label = FACILITY_FILTER_OPTIONS.find((f) => f.value === facility)?.label;
			if (label) {
				filters.push({ key: `facility-${facility}`, label: "Facility", value: label });
			}
		});

		return filters;
	}, [searchState]);

	const handleRemoveFilter = (filterKey: string) => {
		if (filterKey === "type") updateSearch({ type: "" });
		else if (filterKey === "price") {
			updateSearch({ minPrice: PRICE_FILTER_CONFIG.MIN, maxPrice: PRICE_FILTER_CONFIG.MAX });
		} else if (filterKey.startsWith("facility-")) {
			const facilityValue = filterKey.replace("facility-", "");

			updateSearch({ facilities: searchState.facilities.filter((f) => f !== facilityValue) });
		}
	};

	const formatPrice = (price: number): string =>
		new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(price);

	return {
		// Data
		accommodations,
		totalResults,
		totalPages,

		// UI State
		loading,
		error,
		setError,
		viewMode,
		setViewMode,
		favorites,

		// Search & Filter State
		searchState,
		setSearchState: updateSearch, // Renamed for clarity
		currentPage: searchState.page,
		setCurrentPage,

		// Derived
		activeFilters,

		// Handlers
		handleFacilityChange,
		handleToggleFavorite,
		handleClearAllFilters,
		handleRemoveFilter,
		formatPrice,
	};
}
