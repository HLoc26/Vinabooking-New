import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Container, Grid, Box } from "@mui/material";

import { SearchFiltersSidebar, ActiveFiltersBar, ResultsHeader, AccommodationCard, ResultsSkeleton, ResultsEmptyState, PaginationBar, type ActiveFilter } from "../components/search";

import { useScrollToTopOnMount } from "../../../hooks/useScrollToTopMount";
import { PRICE_FILTER_CONFIG } from "../constants/searchFilters";
import { standardize } from "../../../utils/moneyConverter";
import { usePushNotificationContext } from "../../../context/PushNotification/hook";
import SearchBar from "../components/search/SearchBar/SearchBar";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../app/store";
import { useSearchAccommodations } from "../hooks/useSearchAccommodation";
import { syncFromUrl } from "../../search/searchSlice";
import { parseSearchParamsToQuery } from "../../../utils/search";
import useFacilityList from "../hooks/useFacilityList";
import { EAccommodationType } from "../types/accommodation.types";
import { AdvancedSearchButton } from "../../search/semantic-search/AdvancedSearchButton";

export default function SearchResultPage() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const dispatch = useDispatch();
	const { pushNotification } = usePushNotificationContext();

	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

	const { data, isLoading, error } = useSearchAccommodations();

	const results = data?.data || [];

	const totalFound = data?.meta.total || 0;

	const totalPages = data?.meta.totalPages || 1;

	const currentPageFromUrl = Number(searchParams.get("page")) || 1;
	// Logic Sync: URL -> Redux
	// Để đảm bảo Sidebar và SearchBar luôn hiển thị đúng trạng thái của URL hiện tại
	useEffect(() => {
		const criteriaFromUrl = parseSearchParamsToQuery(searchParams);
		dispatch(syncFromUrl(criteriaFromUrl));
	}, [searchParams, dispatch]);

	const criteria = useSelector((state: RootState) => state.search);
	const { data: facilities = [] } = useFacilityList(); // List danh sách tiện ích để map ID -> Name

	useEffect(() => {
		if (error) {
			pushNotification(error.message || "Có lỗi xảy ra khi tìm kiếm", "error");
		}
	}, [error, pushNotification]);

	const handleChangePage = (page: number) => {
		const params = new URLSearchParams(searchParams);
		params.set("page", page.toString());
		window.scrollTo(0, 0);
		navigate(`/search?${params.toString()}`);
	};

	const handleRemoveFilter = (filterKey: string) => {
		const params = new URLSearchParams(searchParams);

		// Reset về trang 1 khi đổi filter
		params.set("page", "1");

		if (filterKey === "type") {
			params.delete("type");
		} else if (filterKey === "price") {
			params.delete("minPrice");
			params.delete("maxPrice");
		} else if (filterKey.startsWith("facility-")) {
			const facilityToRemove = filterKey.replace("facility-", "");
			const currentFacilities = params.get("facilities")?.split(",") || [];
			const newFacilities = currentFacilities.filter((f) => f !== facilityToRemove);

			if (newFacilities.length > 0) {
				params.set("facilities", newFacilities.join(","));
			} else {
				params.delete("facilities");
			}
		}

		navigate(`/search?${params.toString()}`);
	};

	const handleClearAllFilters = () => {
		const params = new URLSearchParams();
		// Giữ lại keyword, ngày tháng, số người
		if (searchParams.get("keyword")) params.set("keyword", searchParams.get("keyword")!);
		if (searchParams.get("checkIn")) params.set("checkIn", searchParams.get("checkIn")!);
		if (searchParams.get("checkOut")) params.set("checkOut", searchParams.get("checkOut")!);
		if (searchParams.get("adults")) params.set("adults", searchParams.get("adults")!);
		if (searchParams.get("children")) params.set("children", searchParams.get("children")!);
		if (searchParams.get("rooms")) params.set("rooms", searchParams.get("rooms")!);

		navigate(`/search?${params.toString()}`);
	};
	const handleCardClick = (id: string) => {
		navigate(`/accommodation/${id}`);
	};

	const activeFilters = useMemo(() => {
		const filters: ActiveFilter[] = [];

		// Type filter
		if (criteria.type && criteria.type !== EAccommodationType.ALL) {
			filters.push({ key: "type", label: "Loại hình", value: criteria.type });
		}

		// Price filter
		const min = criteria.price.min;
		const max = criteria.price.max;
		const isDefaultPrice = min === PRICE_FILTER_CONFIG.MIN && max === PRICE_FILTER_CONFIG.MAX;

		if (!isDefaultPrice) {
			filters.push({
				key: "price",
				label: "Khoảng giá",
				value: `${standardize(min)} - ${standardize(max)}`,
			});
		}

		// Facilities filter
		if (criteria.facilities && criteria.facilities.length > 0) {
			criteria.facilities.forEach((facId) => {
				const facName = facilities.find((f) => f.id === facId)?.name || facId;
				filters.push({ key: `facility-${facId}`, label: "Tiện ích", value: facName });
			});
		}

		return filters;
	}, [criteria, facilities]);

	useScrollToTopOnMount();

	return (
		<Box sx={{ minHeight: "100vh", pb: 4 }}>
			<SearchBar />
			<Container maxWidth="xl" sx={{ mt: 3 }}>
				<Grid container spacing={3}>
					{/* Left Sidebar - Filters */}
					<Grid size={{ xs: 12, md: 3 }}>
						<SearchFiltersSidebar facilityList={facilities} loading={isLoading} />
					</Grid>

					{/* Right Content - Results */}
					<Grid size={{ xs: 12, md: 9 }}>
						{/* Advanced Search Entry */}
						<Box mb={2} display="flex" justifyContent="flex-end">
							<AdvancedSearchButton />
						</Box>

						{/* Active Filters Bar */}
						<ActiveFiltersBar filters={activeFilters} onRemoveFilter={handleRemoveFilter} onClearAllFilters={handleClearAllFilters} />

						{/* Results Header */}
						<ResultsHeader total={totalFound} loading={isLoading} viewMode={viewMode} onChangeViewMode={setViewMode} />

						{isLoading ? (
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

						{!isLoading && results.length > 0 && (
							<PaginationBar //
								page={currentPageFromUrl}
								totalPages={totalPages}
								disabled={isLoading}
								onChangePage={handleChangePage}
							/>
						)}
					</Grid>
				</Grid>
			</Container>
		</Box>
	);
}
