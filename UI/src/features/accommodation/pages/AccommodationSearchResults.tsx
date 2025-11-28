import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Grid, Box } from "@mui/material";

import { SearchFiltersSidebar, ActiveFiltersBar, ResultsHeader, AccommodationCard, ResultsSkeleton, ResultsEmptyState, PaginationBar, type ActiveFilter } from "../components/search";

import { useScrollToTopOnMount } from "../../../hooks/useScrollToTopMount";
import useSearchFromParams from "../hooks/useSearchFromParams";
import useSearchContext from "../../../context/SearchContext/hook";
import { PRICE_FILTER_CONFIG } from "../constants/searchFilters";
import { standardize } from "../../../utils/moneyConverter";
import useFacilityList from "../hooks/useFacilityList";
import { EAccommodationType } from "../../../types/Accommodation";
import { usePushNotificationContext } from "../../../context/PushNotification/hook";
import { HeroSearchBar } from "../../../components/shared/HeroSearchBar";

export default function AccommodationSearchResults() {
	const navigate = useNavigate();

	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

	const { criteria, error, results, totalPages, loading } = useSearchFromParams();

	const { handleUpdateSearchCriteria } = useSearchContext();

	const { pushNotification } = usePushNotificationContext();

	if (error) {
		pushNotification(error, "error");
	}

	const handleChangePage = (page: number) => {
		handleUpdateSearchCriteria("pagination", { ...criteria.pagination, page });
		const params = new URLSearchParams(window.location.search);
		params.set("page", page.toString());
		window.scrollTo(0, 0);
		navigate(`/search?${params.toString()}`);
	};

	const facilities = useFacilityList();

	const activeFilters = useMemo(() => {
		const filters: ActiveFilter[] = [];

		// Type filter: chỉ thêm nếu không phải ALL
		if (criteria.type && criteria.type !== EAccommodationType.ALL) {
			const typeLabel = criteria.type.toString();
			filters.push({ key: "type", label: "Type", value: typeLabel });
		}

		// Price filter
		if (criteria.price.min > PRICE_FILTER_CONFIG.MIN || criteria.price.max < PRICE_FILTER_CONFIG.MAX) {
			filters.push({
				key: "price",
				label: "Price Range",
				value: `${standardize(criteria.price.min)} - ${standardize(criteria.price.max)}`,
			});
		}

		// Facilities
		const facilityStrs = facilities.map((f) => f.name);
		criteria.facilities.filter((f) => facilityStrs.includes(f)).map((f) => filters.push({ key: `facility-${f}`, label: "Facility", value: f }));

		return filters;
	}, [criteria.facilities, criteria.price.max, criteria.price.min, criteria.type, facilities]);

	const handleRemoveFilter = (filterKey: string) => {
		const params = new URLSearchParams(window.location.search);

		if (filterKey === "type") {
			params.delete("type");
		} else if (filterKey === "price") {
			params.set("minPrice", PRICE_FILTER_CONFIG.MIN.toString());
			params.set("maxPrice", PRICE_FILTER_CONFIG.MAX.toString());
		} else if (filterKey.startsWith("facility-")) {
			const facilityValue = filterKey.replace("facility-", "");
			const currentFacilities = criteria.facilities.filter((f) => f !== facilityValue);

			params.set("facilities", currentFacilities.join(","));
		}

		navigate(`/search?${params.toString()}`);
	};

	const handleClearAllFilters = () => {
		const params = new URLSearchParams();

		params.set("type", "");
		params.set("minPrice", PRICE_FILTER_CONFIG.MIN.toString());
		params.set("maxPrice", PRICE_FILTER_CONFIG.MAX.toString());
		params.set("facilities", "");

		navigate(`/search?${params.toString()}`);
	};

	const handleCardClick = (id: string) => {
		navigate(`/accommodation/${id}`);
	};

	useScrollToTopOnMount();

	return (
		<Box sx={{ minHeight: "100vh", pb: 4 }}>
			<HeroSearchBar />
			<Container maxWidth="xl" sx={{ mt: 3 }}>
				<Grid container spacing={3}>
					{/* Left Sidebar - Filters */}
					<Grid size={{ xs: 12, md: 3 }}>
						<SearchFiltersSidebar facilityList={facilities} />
					</Grid>

					{/* Right Content - Results */}
					<Grid size={{ xs: 12, md: 9 }}>
						{/* Active Filters Bar */}
						<ActiveFiltersBar filters={activeFilters} onRemoveFilter={handleRemoveFilter} onClearAllFilters={handleClearAllFilters} />

						{/* Results Header */}
						<ResultsHeader loading={loading} viewMode={viewMode} onChangeViewMode={setViewMode} />

						{loading ? (
							<ResultsSkeleton viewMode={viewMode} />
						) : results.length === 0 ? (
							<ResultsEmptyState onClearAllFilters={handleClearAllFilters} />
						) : viewMode === "grid" ? (
							<Grid container spacing={3}>
								{results.map((accommodation) => (
									<Grid key={accommodation.id} size={{ xs: 12, sm: 6, lg: 4 }}>
										<AccommodationCard //
											accommodation={accommodation}
											variant={viewMode}
											onClick={handleCardClick}
										/>
									</Grid>
								))}
							</Grid>
						) : (
							<Box>
								{results.map((accommodation) => (
									<AccommodationCard //
										key={accommodation.id}
										accommodation={accommodation}
										variant={viewMode}
										onClick={handleCardClick}
									/>
								))}
							</Box>
						)}

						{!loading && results.length > 0 && (
							<PaginationBar //
								page={criteria.pagination.page}
								totalPages={totalPages}
								disabled={loading}
								onChangePage={handleChangePage}
							/>
						)}
					</Grid>
				</Grid>
			</Container>
		</Box>
	);
}
