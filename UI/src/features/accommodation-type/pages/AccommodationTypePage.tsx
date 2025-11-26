import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Container, Typography } from "@mui/material";
import { Hero } from "../components/Hero";
import HorizontalList from "../components/HorizontalList";
import { CityCard } from "../components/CityCard";
import { EAccommodationType } from "../../../types/Accommodation";
import type { City } from "../types/City";
import { useScrollToTopOnMount } from "../hooks/useScrollToTopOnMount";
import { LocationSearchProvider } from "../../../context/SearchContext/Index";
import { useCityCounts } from "../hooks/useCityCount";
import { ACCOMMODATION_LABELS, CITY_NAMES } from "../constants/Const";
import { CITIES } from "../../home/constants/CityConst";

const CITY_IMAGES: Record<string, string> = Object.fromEntries(CITIES.map((c) => [c.name.toLowerCase(), c.imageUrl]));

const parseAccommodationType = (param: string | undefined): EAccommodationType => {
	if (!param) return EAccommodationType.HOTEL;
	const normalized = param.toUpperCase().replace(/-/g, "*").replace(/\s+/g, "*");
	return Object.values(EAccommodationType).includes(normalized as EAccommodationType) ? (normalized as EAccommodationType) : EAccommodationType.HOTEL;
};

const accommodationTypeToParam = (type: EAccommodationType) => type.toLowerCase();

export default function AccommodationTypePage() {
	const { accommodationType: accommodationTypeParam } = useParams<{ accommodationType: string }>();
	const navigate = useNavigate();

	const [accommodationType, setAccommodationType] = useState<EAccommodationType>(parseAccommodationType(accommodationTypeParam));

	useEffect(() => {
		setAccommodationType(parseAccommodationType(accommodationTypeParam));
	}, [accommodationTypeParam]);

	const handleTypeChange = (newType: EAccommodationType) => {
		setAccommodationType(newType);
		navigate(`/${accommodationTypeToParam(newType)}`, { replace: true });
	};

	const { cityCounts, loading } = useCityCounts(CITY_NAMES, accommodationType);

	// Only include cities with at least 1 property
	const currentCities: City[] = useMemo(
		() =>
			CITY_NAMES.filter((name) => (cityCounts[name] ?? 0) > 0).map((name) => ({
				id: name.toLowerCase(),
				name,
				propertyCount: cityCounts[name] ?? 0,
				imageUrl: CITY_IMAGES[name.toLowerCase()],
			})),
		[cityCounts]
	);

	useScrollToTopOnMount();

	if (loading) return <div>Loading...</div>;

	return (
		<Box sx={{ minHeight: "100vh", pb: 8 }}>
			<LocationSearchProvider>
				<Hero currentType={accommodationType} onTypeChange={handleTypeChange} />
			</LocationSearchProvider>
			<Container maxWidth="lg">
				<Box sx={{ display: "flex", flexDirection: "column", gap: 6, mt: 4 }}>
					{currentCities.length > 0 ? (
						<HorizontalList
							title={`Cities with ${ACCOMMODATION_LABELS[accommodationType]}s`}
							items={currentCities}
							renderItem={(city) => (
								<Box sx={{ px: 1 }}>
									<CityCard city={city} typeLabel={ACCOMMODATION_LABELS[accommodationType] ?? "Unknown"} />
								</Box>
							)}
						/>
					) : (
						<Box
							sx={{
								display: "flex",
								flexDirection: "column",
								alignItems: "center",
								mt: 6,
								p: 5,
								borderRadius: 4,
								backgroundColor: "#fafafa",
								border: "1px solid #e0e0e0",
								width: "100%",
								gap: 2,
							}}
						>
							<img src="https://cdn-icons-png.flaticon.com/512/6598/6598519.png" alt="No results cartoon" style={{ width: 160, marginBottom: 16 }} />

							<Typography variant="h5" fontWeight={700}>
								Oops!
							</Typography>

							<Typography variant="body1" color="text.secondary" textAlign="center" sx={{ maxWidth: 400 }}>
								Looks like we don't have any {ACCOMMODATION_LABELS[accommodationType] ?? "place"}s available in these cities yet.
							</Typography>
						</Box>
					)}
				</Box>
			</Container>
		</Box>
	);
}
