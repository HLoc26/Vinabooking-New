import { Box, Container, Typography } from "@mui/material";
import HorizontalList from "./HorizontalList";
import { ACCOMMODATION_LABELS } from "../constants/Const";
import type { AccommodationDetail, EAccommodationType } from "../../accommodation/types/accommodation.types";
import { useMemo } from "react";
import CityCard from "./CityCard";
import type { City } from "../types/City";
import { CITIES } from "../constants/CityConst";
import useAccommodationsByType from "../../accommodation/hooks/useAccommodationsByType";
import { ACCOMMODATION_DEFAULT_IMAGES } from "../../accommodation/types/Const";

type AccommodationTypeHomeContentProps = {
	type: EAccommodationType;
};

const AccommodationTypeHomeContent: React.FC<AccommodationTypeHomeContentProps> = ({ type }) => {
	const { data: accommodations = [] } = useAccommodationsByType(type);
	// Group theo city
	const currentCities: City[] = useMemo(() => {
		const grouped = accommodations.reduce(
			(acc, item) => {
				const city = item.address?.city ?? "Unknown";
				if (!acc[city]) acc[city] = [];
				acc[city].push(item);
				return acc;
			},
			{} as Record<string, AccommodationDetail[]>
		);

		console.log(grouped);

		return Object.entries(grouped)
			.map(([city, list]) => {
				const fallbackImage = CITIES.find((c) => c.name.toLowerCase() === city.toLowerCase())?.imageUrl;
				const imageUrl = fallbackImage || `${ACCOMMODATION_DEFAULT_IMAGES[type]}`;
				return {
					id: city.toLowerCase(),
					name: city,
					propertyCount: list.length,
					imageUrl,
				};
			})
			.sort((a, b) => b.propertyCount - a.propertyCount);
	}, [accommodations, type]);

	return (
		<Container maxWidth="lg">
			<Box sx={{ display: "flex", flexDirection: "column", gap: 6, mt: 4 }}>
				{currentCities.length > 0 ? (
					<HorizontalList
						title={`Cities with ${ACCOMMODATION_LABELS[type]}s`}
						items={currentCities}
						renderItem={(city) => (
							<Box sx={{ px: 1 }}>
								<CityCard city={city} type={type} typeLabel={ACCOMMODATION_LABELS[type]} />
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
						<img src="/images/error.png" alt="No results cartoon" style={{ width: 160, marginBottom: 16 }} />

						<Typography variant="h5" fontWeight={700}>
							Oops!
						</Typography>

						<Typography variant="body1" color="text.secondary" textAlign="center" sx={{ maxWidth: 400 }}>
							Looks like we don't have any {ACCOMMODATION_LABELS[type] ?? "place"}s available in these cities yet.
						</Typography>
					</Box>
				)}
			</Box>
		</Container>
	);
};

export default AccommodationTypeHomeContent;
