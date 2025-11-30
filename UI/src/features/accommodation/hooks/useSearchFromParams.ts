import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import type { Query, SortOption } from "../../../types/Query";
import { EAccommodationType } from "../../../types/Accommodation";
import accommodationApi from "../../../services/accommodationApi";
import useSearchContext from "../../../context/SearchContext/hook";
import { parseEAccommodationType } from "../../../utils/search";
import type { AccommodationListItem } from "../../../types/Response";
import isEqual from "lodash.isequal";

function parseDate(value: string | null): Date | null {
	if (!value) return null;
	const d = new Date(value);
	d.setHours(0, 0, 0, 0);
	return d;
}

function parseSortOption(value: string | null): SortOption {
	const validOptions: SortOption[] = ["price_asc", "price_desc", "newest", "rating", "recommended"];
	if (value && validOptions.includes(value as SortOption)) {
		return value as SortOption;
	}
	return "recommended"; // fallback
}

function buildApiParams(criteria: Query): Record<string, string | number> {
	const params: Record<string, string | number> = {
		keyword: criteria.keyword,
		type: isEqual(criteria.type, EAccommodationType.ALL) ? "" : criteria.type,
		sortBy: criteria.sortBy,
		page: criteria.pagination.page,
		limit: criteria.pagination.limit,
		adults: criteria.guests.adults,
		children: criteria.guests.children,
		rooms: criteria.guests.rooms,
		minPrice: criteria.price.min,
		maxPrice: criteria.price.max,
	};

	if (criteria.dates.checkIn) params.checkIn = criteria.dates.checkIn.toISOString().split("T")[0];
	if (criteria.dates.checkOut) params.checkOut = criteria.dates.checkOut.toISOString().split("T")[0];

	if (criteria.facilities.length > 0) params.facilities = criteria.facilities.join(",");

	return params;
}

const useSearchFromParams = () => {
	const { searchCriteria: contextCriteria, handleUpdateSearchCriteria } = useSearchContext();
	const [params] = useSearchParams();

	// parse params -> criteria
	const criteria: Query = useMemo(() => {
		const checkIn = parseDate(params.get("checkIn"));
		const checkOut = parseDate(params.get("checkOut"));

		return {
			keyword: params.get("keyword") || "",
			type: parseEAccommodationType(params.get("type")),

			dates: {
				checkIn: checkIn ?? new Date(),
				checkOut: checkOut,
			},

			guests: {
				adults: Number(params.get("adults") || 2),
				children: Number(params.get("children") || 0),
				rooms: Number(params.get("rooms") || 1),
			},

			price: {
				min: Number(params.get("minPrice") || 0),
				max: params.get("maxPrice") ? Number(params.get("maxPrice")) : contextCriteria.price.max,
			},

			facilities: params.get("facilities")?.split(",").filter(Boolean) || [],

			sortBy: parseSortOption(params.get("sortBy")),

			pagination: {
				page: Number(params.get("page") || 1),
				limit: Number(params.get("limit") || 18),
			},
		};
	}, [params]);

	// data + state
	const [loading, setLoading] = useState<boolean>(true);
	const [error, setError] = useState<string | null>(null);
	const [results, setResults] = useState<AccommodationListItem[]>([]);
	const [total, setTotal] = useState<number>(0);
	const [totalPages, setTotalPages] = useState<number>(1);

	// fetch API when params changes
	useEffect(() => {
		let canceled = false;

		async function load() {
			setLoading(true);
			setError(null);

			try {
				const apiParams = buildApiParams(criteria);

				const res = await accommodationApi.search(apiParams);

				if (!res.data) {
					setResults([]);
					setTotal(0);
					setTotalPages(0);
					return;
				}

				if (!canceled) {
					setResults(res.data.data);
					setTotal(res.data.meta.total);
					setTotalPages(res.data.meta.totalPages);
				}
			} catch (err) {
				console.error(err);
				if (!canceled) {
					setError("Error loading results");
				}
			} finally {
				if (!canceled) {
					setLoading(false);
				}
			}
		}

		load();
		return () => {
			canceled = true;
		};
	}, [criteria]);

	useEffect(() => {
		if (!isEqual(contextCriteria, criteria)) {
			handleUpdateSearchCriteria("dates", criteria.dates);
			handleUpdateSearchCriteria("facilities", criteria.facilities);
			handleUpdateSearchCriteria("guests", criteria.guests);
			handleUpdateSearchCriteria("keyword", criteria.keyword);
			handleUpdateSearchCriteria("pagination", criteria.pagination);
			handleUpdateSearchCriteria("price", criteria.price);
			handleUpdateSearchCriteria("sortBy", criteria.sortBy);
			handleUpdateSearchCriteria("type", criteria.type);
		}
	}, [criteria, contextCriteria, handleUpdateSearchCriteria]);

	return {
		criteria,
		results,
		total,
		totalPages,
		loading,
		error,
	};
};

export default useSearchFromParams;
