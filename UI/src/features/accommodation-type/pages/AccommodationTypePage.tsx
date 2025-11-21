import { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Container } from "@mui/material";
import { Hero } from "../components/Hero";
import HorizontalList from "../components/HorizontalList";
import { CityCard } from "../components/CityCard";
import { PropertyCard } from "../components/PropertyCard";
import { EAccommodationType } from "../../../types/acommodation";
import type { City } from "../services/types/City";
import type { Property } from "../services/types/Property";

import { ACCOMMODATION_LABELS, CITY_NAMES } from "../constants/Const";

// Helper function to convert URL param to EAccommodationType
const parseAccommodationType = (param: string | undefined): EAccommodationType => {
	if (!param) return EAccommodationType.HOTEL;

	const paramUpper = param.toUpperCase();

	// Check if the param matches any enum value
	if (Object.values(EAccommodationType).includes(paramUpper as EAccommodationType)) {
		return paramUpper as EAccommodationType;
	}

	// Default to HOTEL if invalid
	return EAccommodationType.HOTEL;
};

// Helper function to convert EAccommodationType to URL param
const accommodationTypeToParam = (type: EAccommodationType): string => {
	return type.toLowerCase();
};

export function AcommodationTypePage() {
	const { accommodationType: accommodationTypeParam } = useParams<{ accommodationType: string }>();
	const navigate = useNavigate();

	const [accommodationType, setAccommodationType] = useState<EAccommodationType>(parseAccommodationType(accommodationTypeParam));

	// Sync state with URL parameter
	useEffect(() => {
		const parsedType = parseAccommodationType(accommodationTypeParam);
		setAccommodationType(parsedType);
	}, [accommodationTypeParam]);

	// Handle accommodation type change and update URL
	const handleTypeChange = (newType: EAccommodationType) => {
		setAccommodationType(newType);
		navigate(`/${accommodationTypeToParam(newType)}`, { replace: true });
	};

	const { currentCities, currentProperties } = useMemo(() => {
		const label = ACCOMMODATION_LABELS[accommodationType];

		const cities: City[] = CITY_NAMES.map((name, index) => ({
			id: `city-${index}`,
			name: name,
			propertyCount: Math.floor(Math.random() * 1000) + 150,
			imageUrl: `https://picsum.photos/seed/${name.replace(" ", "")}${accommodationType}/400/300`,
		}));

		const properties: Property[] = Array.from({ length: 8 }).map((_, i) => ({
			id: `${accommodationType}-${i}`,
			title: i === 0 ? `Grand ${label} ${CITY_NAMES[0]}` : `The ${label} at ${CITY_NAMES[i % CITY_NAMES.length]}`,
			location: CITY_NAMES[i % CITY_NAMES.length],
			imageUrl: `https://picsum.photos/seed/${accommodationType}${i}v2/600/400`,
			price: (accommodationType === EAccommodationType.VILLA ? 300 : 80) + i * 15,
			rating: 4.0 + Math.random(),
			reviews: Math.floor(Math.random() * 500) + 50,
			type: accommodationType,
		}));

		return { currentCities: cities, currentProperties: properties };
	}, [accommodationType]);

	return (
		<Box sx={{ minHeight: "100vh", pb: 8 }}>
			<Hero currentType={accommodationType} onTypeChange={handleTypeChange} />

			<Container maxWidth="lg">
				<Box mt={-4} position="relative" zIndex={10}></Box>

				<HorizontalList
					title={`Famous cities for ${ACCOMMODATION_LABELS[accommodationType]}s`}
					items={currentCities}
					renderItem={(city) => <CityCard city={city} typeLabel={ACCOMMODATION_LABELS[accommodationType] ?? "Unknown"} />}
				/>

				<HorizontalList
					title={`Most booked ${ACCOMMODATION_LABELS[accommodationType]}s`}
					items={currentProperties}
					onSeeAll={() => console.log("See all properties")}
					renderItem={(property) => <PropertyCard property={property} />}
				/>

				<HorizontalList title="Recently viewed" items={[...currentProperties].reverse().slice(0, 4)} renderItem={(property) => <PropertyCard property={property} />} />
			</Container>
		</Box>
	);
}
