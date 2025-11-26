import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Grid, Box, Snackbar, Alert } from "@mui/material";

import { SearchFiltersSidebar, ActiveFiltersBar, ResultsHeader, AccommodationCard, ResultsSkeleton, ResultsEmptyState, PaginationBar } from "../components/search";

import { useAccommodationSearch } from "../hooks/useAccommodationSearch";
import { PRICE_FILTER_CONFIG } from "../constants/searchFilters";

export default function AccommodationSearchResults() {
	const navigate = useNavigate();

	const {
		accommodations,
		totalResults,
		totalPages,
		loading,
		error,
		setError,
		viewMode,
		setViewMode,
		favorites,
		searchState,
		setSearchState,
		currentPage,
		setCurrentPage,
		activeFilters,
		handleFacilityChange,
		handleToggleFavorite,
		handleClearAllFilters,
		handleRemoveFilter,
		formatPrice,
	} = useAccommodationSearch();

	const handleCardClick = (id: string) => {
		navigate(`/accommodation/${id}`);
	};

	// Create dynamic facility options based on search results
	const facilityOptions = useMemo(() => {
		const availableFacilities = new Set<string>();
		accommodations.forEach((acc) => {
			acc.facilities?.forEach((facility) => {
				availableFacilities.add(facility);
			});
		});

		// Map the unique facility names back to the full option object
		return availableFacilities;
	}, [accommodations]);

	return (
		<Box sx={{ bgcolor: "#f5f7fa", minHeight: "100vh", py: 4 }}>
			<Container maxWidth="xl">
				{error && (
					<Snackbar open={true} autoHideDuration={6000} onClose={() => setError(null)} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
						<Alert onClose={() => setError(null)} severity="error" sx={{ width: "100%" }}>
							{error}
						</Alert>
					</Snackbar>
				)}

				<Grid container spacing={3}>
					{/* Left Sidebar - Filters */}
					<Grid size={{ xs: 12, md: 3 }}>
						<SearchFiltersSidebar
							loading={loading}
							selectedType={searchState.type}
							onChangeType={(type) => setSearchState({ type })}
							priceRange={[searchState.minPrice, searchState.maxPrice]}
							minPriceInput={String(searchState.minPrice)}
							maxPriceInput={String(searchState.maxPrice)}
							onChangeMinPriceInput={(value) => {
								const numValue = parseInt(value);
								if (!isNaN(numValue) && numValue >= PRICE_FILTER_CONFIG.MIN && numValue < searchState.maxPrice) {
									setSearchState({ minPrice: numValue });
								}
							}}
							onChangeMaxPriceInput={(value) => {
								const numValue = parseInt(value);
								if (!isNaN(numValue) && numValue <= PRICE_FILTER_CONFIG.MAX && numValue > searchState.minPrice) {
									setSearchState({ maxPrice: numValue });
								}
							}}
							onChangePriceRange={(range) => setSearchState({ minPrice: range[0], maxPrice: range[1] })}
							facilityOptions={Array.from(facilityOptions)} // Pass dynamic options
							selectedFacilities={searchState.facilities}
							onToggleFacility={handleFacilityChange}
							onClearAllFilters={handleClearAllFilters}
							formatPrice={formatPrice}
						/>
					</Grid>

					{/* Right Content - Results */}
					<Grid size={{ xs: 12, md: 9 }}>
						{/* Active Filters Bar */}
						<ActiveFiltersBar filters={activeFilters} onRemoveFilter={handleRemoveFilter} onClearAllFilters={handleClearAllFilters} />

						{/* Results Header */}
						<ResultsHeader
							totalResults={totalResults}
							loading={loading}
							sortBy={searchState.sortBy}
							onChangeSort={(value) => setSearchState({ sortBy: value })}
							viewMode={viewMode}
							onChangeViewMode={setViewMode}
						/>

						{loading ? (
							<ResultsSkeleton viewMode={viewMode} />
						) : accommodations.length === 0 ? (
							<ResultsEmptyState onClearAllFilters={handleClearAllFilters} />
						) : viewMode === "grid" ? (
							<Grid container spacing={3}>
								{accommodations.map((accommodation) => (
									<Grid key={accommodation.id} size={{ xs: 12, sm: 6, lg: 4 }}>
										<AccommodationCard
											accommodation={accommodation}
											variant="grid"
											isFavorite={favorites.has(accommodation.id)}
											onToggleFavorite={handleToggleFavorite}
											onClick={handleCardClick}
											formatPrice={formatPrice}
										/>
									</Grid>
								))}
							</Grid>
						) : (
							<Box>
								{accommodations.map((accommodation) => (
									<AccommodationCard
										key={accommodation.id}
										accommodation={accommodation}
										variant="list"
										isFavorite={favorites.has(accommodation.id)}
										onToggleFavorite={handleToggleFavorite}
										onClick={handleCardClick}
										formatPrice={formatPrice}
									/>
								))}
							</Box>
						)}

						{!loading && accommodations.length > 0 && <PaginationBar page={currentPage} totalPages={totalPages} disabled={loading} onChangePage={(page) => setCurrentPage(page)} />}
					</Grid>
				</Grid>
			</Container>
		</Box>
	);
}
