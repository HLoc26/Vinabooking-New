import { Hero } from "../components/Hero";
import { EAccommodationType } from "../../../types/Accommodation";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import HomeContent from "../components/HomeContent";
import { Box } from "@mui/material";
import AccommodationTypeHomeContent from "../components/CustomHomeContent";

const parseAccommodationType = (param: string | undefined): EAccommodationType => {
	if (!param) return EAccommodationType.ALL;
	const normalized = param.toUpperCase().replace(/-/g, "*").replace(/\s+/g, "*");
	return Object.values(EAccommodationType).includes(normalized as EAccommodationType) ? (normalized as EAccommodationType) : EAccommodationType.HOTEL;
};

export function HomePage() {
	const { accommodationType: accommodationTypeParam } = useParams<{ accommodationType: string }>();

	const [accommodationType, setAccommodationType] = useState<EAccommodationType>(parseAccommodationType(accommodationTypeParam));

	useEffect(() => {
		setAccommodationType(parseAccommodationType(accommodationTypeParam));
	}, [accommodationTypeParam]);

	return (
		<Box minHeight="100vh" display="flex" flexDirection="column" bgcolor="#f9fafb">
			<Hero
				currentType={accommodationType}
				onTypeChange={(newType: EAccommodationType) => {
					setAccommodationType(newType);
				}}
			/>

			{accommodationType === EAccommodationType.ALL ? <HomeContent /> : <AccommodationTypeHomeContent type={accommodationType} />}
		</Box>
	);
}
