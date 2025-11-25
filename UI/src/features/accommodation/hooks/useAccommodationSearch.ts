import { useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams as useRouterSearchParams } from "react-router-dom";

import { accommodationService } from "../services/accommodationService";
import type { AccommodationListItem, SearchAccommodationParams, SortOption } from "../types/accommodation.types";
import { ACCOMMODATION_TYPE_OPTIONS, FACILITY_FILTER_OPTIONS, PRICE_FILTER_CONFIG } from "../constants/searchFilters";
import type { ActiveFilter } from "../components/search";

/**
 * Format Date -> "YYYY-MM-DD"
 */
function formatDate(date: Date): string {
	return date.toISOString().split("T")[0];
}

/**
 * Validate check-in / check-out
 * - check-in >= today
 * - check-out > check-in
 * Trả về message lỗi hoặc null nếu hợp lệ
 */
function validateDates(checkIn: string, checkOut: string): string | null {
	if (!checkIn || !checkOut) return null;

	const today = new Date();
	today.setHours(0, 0, 0, 0);

	const inDate = new Date(checkIn);
	const outDate = new Date(checkOut);

	if (isNaN(inDate.getTime()) || isNaN(outDate.getTime())) {
		return "Invalid date format.";
	}

	if (inDate < today) {
		return "Check-in date cannot be in the past.";
	}

	if (outDate <= inDate) {
		return "Check-out date must be after check-in date.";
	}

	return null;
}

/**
 * Quản lý toàn bộ state + logic cho trang search:
 * - đọc URL query
 * - gọi API
 * - filter (type, facilities, price)
 * - sort, pagination
 * - favorites (tạm thời giữ ở đây luôn cho gọn)
 */
export function useAccommodationSearch() {
	const navigate = useNavigate();
	const [urlSearchParams] = useRouterSearchParams();

	// Data states
	const [accommodations, setAccommodations] = useState<AccommodationListItem[]>([]);
	const [totalResults, setTotalResults] = useState<number>(0);
	const [totalPages, setTotalPages] = useState<number>(1);

	// UI states
	const [loading, setLoading] = useState<boolean>(false);
	const [error, setError] = useState<string | null>(null);
	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [favorites, setFavorites] = useState<Set<string>>(new Set());
	const [isInitialized, setIsInitialized] = useState<boolean>(false);

	// Parse URL params on mount
	const getInitialSearchParams = useCallback(() => {
		// Default: today & today + 2 days
		const today = new Date();
		const defaultCheckIn = formatDate(today);

		const after2Days = new Date(today);
		after2Days.setDate(after2Days.getDate() + 2);
		const defaultCheckOut = formatDate(after2Days);

		return {
			keyword: urlSearchParams.get("keyword") || "",
			checkIn: urlSearchParams.get("checkIn") || defaultCheckIn,
			checkOut: urlSearchParams.get("checkOut") || defaultCheckOut,
			adults: parseInt(urlSearchParams.get("adults") || "2"),
			children: parseInt(urlSearchParams.get("children") || "0"),
			rooms: parseInt(urlSearchParams.get("rooms") || "1"),
			sortBy: (urlSearchParams.get("sortBy") as SortOption) || "recommended",
		};
	}, [urlSearchParams]);

	const getInitialPriceRange = useCallback((): number[] => {
		const minPrice = parseInt(urlSearchParams.get("minPrice") || String(PRICE_FILTER_CONFIG.MIN));
		const maxPrice = parseInt(urlSearchParams.get("maxPrice") || String(PRICE_FILTER_CONFIG.MAX));
		return [minPrice, maxPrice];
	}, [urlSearchParams]);

	const getInitialFacilities = useCallback((): string[] => {
		const facilitiesParam = urlSearchParams.get("facilities");
		return facilitiesParam ? facilitiesParam.split(",") : [];
	}, [urlSearchParams]);

	// Search & Filter states
	const [currentPage, setCurrentPage] = useState<number>(parseInt(urlSearchParams.get("page") || "1"));
	const [searchParams, setSearchParams] = useState(getInitialSearchParams());
	const [priceRange, setPriceRange] = useState<number[]>(getInitialPriceRange());
	const [selectedFacilities, setSelectedFacilities] = useState<string[]>(getInitialFacilities());
	const [selectedType, setSelectedType] = useState<string>(urlSearchParams.get("type") || "");

	// Price input states
	const [minPriceInput, setMinPriceInput] = useState<string>(String(priceRange[0]));
	const [maxPriceInput, setMaxPriceInput] = useState<string>(String(priceRange[1]));

	// Sync URL with state
	const updateURL = useCallback(
		(params: {
			keyword?: string;
			checkIn?: string;
			checkOut?: string;
			adults?: number;
			children?: number;
			rooms?: number;
			type?: string;
			minPrice?: number;
			maxPrice?: number;
			facilities?: string[];
			sortBy?: string;
			page?: number;
		}) => {
			const urlParams = new URLSearchParams();

			if (params.keyword) urlParams.set("keyword", params.keyword);
			if (params.checkIn) urlParams.set("checkIn", params.checkIn);
			if (params.checkOut) urlParams.set("checkOut", params.checkOut);
			if (params.adults) urlParams.set("adults", String(params.adults));
			if (params.children) urlParams.set("children", String(params.children));
			if (params.rooms) urlParams.set("rooms", String(params.rooms));
			if (params.type) urlParams.set("type", params.type);
			if (params.minPrice !== undefined) urlParams.set("minPrice", String(params.minPrice));
			if (params.maxPrice !== undefined) urlParams.set("maxPrice", String(params.maxPrice));
			if (params.facilities && params.facilities.length > 0) {
				urlParams.set("facilities", params.facilities.join(","));
			}
			if (params.sortBy) urlParams.set("sortBy", params.sortBy);
			if (params.page && params.page > 1) urlParams.set("page", String(params.page));

			navigate(`/search?${urlParams.toString()}`, { replace: true });
		},
		[navigate]
	);

	// Gọi API
	const fetchAccommodations = useCallback(async () => {
		setLoading(true);
		setError(null);

		// Validate ngày trước khi gọi API
		const dateError = validateDates(searchParams.checkIn, searchParams.checkOut);
		if (dateError) {
			setError(dateError);
			setLoading(false);
			return;
		}

		try {
			const params: SearchAccommodationParams = {
				keyword: searchParams.keyword || undefined,
				checkIn: searchParams.checkIn,
				checkOut: searchParams.checkOut,
				adults: searchParams.adults,
				children: searchParams.children,
				rooms: searchParams.rooms,
				type: selectedType || undefined,
				minPrice: priceRange[0],
				maxPrice: priceRange[1],
				facilities: selectedFacilities.length > 0 ? selectedFacilities : undefined,
				sortBy: searchParams.sortBy,
				page: currentPage,
				limit: 20,
			};

			updateURL({
				keyword: searchParams.keyword,
				checkIn: searchParams.checkIn,
				checkOut: searchParams.checkOut,
				adults: searchParams.adults,
				children: searchParams.children,
				rooms: searchParams.rooms,
				type: selectedType,
				minPrice: priceRange[0],
				maxPrice: priceRange[1],
				facilities: selectedFacilities,
				sortBy: searchParams.sortBy,
				page: currentPage,
			});

			const result = await accommodationService.searchAccommodations(params);

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
		}
	}, [searchParams, selectedType, priceRange, selectedFacilities, currentPage, updateURL]);

	// Initial load
	useEffect(() => {
		if (!isInitialized) {
			setIsInitialized(true);
			fetchAccommodations();
		}
	}, [isInitialized, fetchAccommodations]);

	// Memoized dependency strings
	const priceRangeString = useMemo(() => JSON.stringify(priceRange), [priceRange]);
	const facilitiesString = useMemo(() => JSON.stringify(selectedFacilities), [selectedFacilities]);

	// Auto-fetch khi filters đổi (debounce)
	useEffect(() => {
		if (!isInitialized) return;

		const timer = setTimeout(() => {
			setCurrentPage(1);
			fetchAccommodations();
			window.scrollTo({ top: 0, behavior: "smooth" });
		}, 800);

		return () => clearTimeout(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedType, priceRangeString, facilitiesString]);

	// Fetch khi đổi page
	useEffect(() => {
		if (!isInitialized) return;
		if (currentPage !== 1) {
			fetchAccommodations();
			window.scrollTo({ top: 0, behavior: "smooth" });
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [currentPage]);

	// Fetch khi đổi sort
	useEffect(() => {
		if (!isInitialized) return;

		if (currentPage === 1) {
			fetchAccommodations();
		} else {
			setCurrentPage(1);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams.sortBy]);

	// Format price
	const formatPrice = (price: number): string => {
		return new Intl.NumberFormat("en-US", {
			style: "currency",
			currency: "USD",
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		}).format(price);
	};

	// Handlers
	const handleFacilityChange = (value: string) => {
		setSelectedFacilities((prev) => (prev.includes(value) ? prev.filter((f) => f !== value) : [...prev, value]));
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

	const handlePriceRangeChange = (range: number[]) => {
		setPriceRange(range);
		setMinPriceInput(String(range[0]));
		setMaxPriceInput(String(range[1]));
	};

	const handleMinPriceInputChange = (value: string) => {
		setMinPriceInput(value);
		const numValue = parseInt(value);
		if (!isNaN(numValue) && numValue >= PRICE_FILTER_CONFIG.MIN && numValue < priceRange[1]) {
			setPriceRange([numValue, priceRange[1]]);
		}
	};

	const handleMaxPriceInputChange = (value: string) => {
		setMaxPriceInput(value);
		const numValue = parseInt(value);
		if (!isNaN(numValue) && numValue <= PRICE_FILTER_CONFIG.MAX && numValue > priceRange[0]) {
			setPriceRange([priceRange[0], numValue]);
		}
	};

	const handleClearAllFilters = () => {
		setSelectedType("");
		setPriceRange([PRICE_FILTER_CONFIG.MIN, PRICE_FILTER_CONFIG.MAX]);
		setMinPriceInput(String(PRICE_FILTER_CONFIG.MIN));
		setMaxPriceInput(String(PRICE_FILTER_CONFIG.MAX));
		setSelectedFacilities([]);
	};

	const getTypeLabel = (type: string): string => {
		const found = ACCOMMODATION_TYPE_OPTIONS.find((t) => t.value === type);
		return found ? found.label : type;
	};

	const activeFilters: ActiveFilter[] = useMemo(() => {
		const filters: ActiveFilter[] = [];

		if (selectedType) {
			filters.push({
				key: "type",
				label: "Type",
				value: getTypeLabel(selectedType),
			});
		}

		if (priceRange[0] > PRICE_FILTER_CONFIG.MIN || priceRange[1] < PRICE_FILTER_CONFIG.MAX) {
			filters.push({
				key: "price",
				label: "Price Range",
				value: `${formatPrice(priceRange[0])} - ${formatPrice(priceRange[1])}`,
			});
		}

		selectedFacilities.forEach((facility) => {
			const found = FACILITY_FILTER_OPTIONS.find((f) => f.value === facility);
			if (found) {
				filters.push({
					key: `facility-${facility}`,
					label: "Facility",
					value: found.label,
				});
			}
		});

		return filters;
	}, [selectedType, priceRange, selectedFacilities]);

	const handleRemoveFilter = (filterKey: string) => {
		if (filterKey === "type") {
			setSelectedType("");
		} else if (filterKey === "price") {
			setPriceRange([PRICE_FILTER_CONFIG.MIN, PRICE_FILTER_CONFIG.MAX]);
			setMinPriceInput(String(PRICE_FILTER_CONFIG.MIN));
			setMaxPriceInput(String(PRICE_FILTER_CONFIG.MAX));
		} else if (filterKey.startsWith("facility-")) {
			const facilityValue = filterKey.replace("facility-", "");
			setSelectedFacilities((prev) => prev.filter((f) => f !== facilityValue));
		}
	};

	return {
		// data
		accommodations,
		totalResults,
		totalPages,

		// ui
		loading,
		error,
		setError,
		viewMode,
		setViewMode,
		favorites,

		// search & filter state
		searchParams,
		setSearchParams,
		currentPage,
		setCurrentPage,
		priceRange,
		minPriceInput,
		maxPriceInput,
		selectedFacilities,
		selectedType,
		setSelectedType,

		// derived
		activeFilters,

		// handlers
		handleFacilityChange,
		handleToggleFavorite,
		handlePriceRangeChange,
		handleMinPriceInputChange,
		handleMaxPriceInputChange,
		handleClearAllFilters,
		handleRemoveFilter,

		formatPrice,
	};
}
