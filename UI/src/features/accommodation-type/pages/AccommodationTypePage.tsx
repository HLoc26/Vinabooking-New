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
				{" "}
				{currentCities.length > 0 ? (
					<HorizontalList
						title={`Cities with ${ACCOMMODATION_LABELS[accommodationType]}s`}
						items={currentCities}
						renderItem={(city) => <CityCard city={city} typeLabel={ACCOMMODATION_LABELS[accommodationType] ?? "Unknown"} />}
					/>
				) : (
					<Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", mt: 8, p: 4, border: "2px dashed #ccc", borderRadius: 4, backgroundColor: "#f9f9f9" }}>
						{" "}
						<img src="https://cdn-icons-png.flaticon.com/512/616/616408.png" alt="Oops cartoon" style={{ width: 150, marginBottom: 24 }} />{" "}
						<Typography variant="h6" fontWeight="bold" gutterBottom>
							{" "}
							Oops!{" "}
						</Typography>{" "}
						<Typography variant="body1" color="textSecondary" textAlign="center">
							{" "}
							There are no {ACCOMMODATION_LABELS[accommodationType] || "Place".toLowerCase()}s available in these cities yet.{" "}
						</Typography>{" "}
					</Box>
				)}{" "}
			</Container>
		</Box>
	);
}
