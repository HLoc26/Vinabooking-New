import { useNavigate } from "react-router-dom";
import { Container, Grid, Box, Snackbar, Alert } from "@mui/material";

import { SearchFiltersSidebar, ActiveFiltersBar, ResultsHeader, AccommodationCard, ResultsSkeleton, ResultsEmptyState, PaginationBar } from "../components/search";

import { useAccommodationSearch } from "../hooks/useAccommodationSearch";

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

		activeFilters,

		handleFacilityChange,
		handleToggleFavorite,
		handlePriceRangeChange,
		handleMinPriceInputChange,
		handleMaxPriceInputChange,
		handleClearAllFilters,
		handleRemoveFilter,

		formatPrice,
	} = useAccommodationSearch();

	// Navigate đến trang chi tiết: /accommodation/:accommodationId
	const handleCardClick = (id: string) => {
		navigate(`/accommodation/${id}`);
	};

	return (
		<Box sx={{ bgcolor: "#f5f7fa", minHeight: "100vh", py: 4 }}>
			<Container maxWidth="xl">
				{/* Error Snackbar */}
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
							selectedType={selectedType}
							onChangeType={setSelectedType}
							priceRange={priceRange}
							minPriceInput={minPriceInput}
							maxPriceInput={maxPriceInput}
							onChangeMinPriceInput={handleMinPriceInputChange}
							onChangeMaxPriceInput={handleMaxPriceInputChange}
							onChangePriceRange={handlePriceRangeChange}
							selectedFacilities={selectedFacilities}
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
							sortBy={searchParams.sortBy}
							onChangeSort={(value) => setSearchParams((prev) => ({ ...prev, sortBy: value }))}
							viewMode={viewMode}
							onChangeViewMode={setViewMode}
						/>

						{/* Results */}
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

						{/* Pagination */}
						{!loading && accommodations.length > 0 && <PaginationBar page={currentPage} totalPages={totalPages} disabled={loading} onChangePage={setCurrentPage} />}
					</Grid>
				</Grid>
			</Container>
		</Box>
	);
}
