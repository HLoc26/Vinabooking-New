import { Hero } from "../components/Hero";
import { EAccommodationType } from "../../accommodation/types/accommodation.types";
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import HomeContent from "../components/HomeContent";
import { Box, ThemeProvider } from "@mui/material";
import AccommodationTypeHomeContent from "../components/AccommodationTypeHomeContent";
import travelerHomeTheme from "../../../theme/travelerHomeTheme";

// Inject Sora + DM Sans fonts
if (typeof document !== "undefined" && !document.getElementById("sora-font")) {
	const link = document.createElement("link");
	link.id = "sora-font";
	link.rel = "stylesheet";
	link.href = "https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap";
	document.head.appendChild(link);
}

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
		<ThemeProvider theme={travelerHomeTheme}>
			<Box minHeight="100vh" display="flex" flexDirection="column" sx={{ bgcolor: "background.default" }}>
				<Hero currentType={accommodationType} onTypeChange={(newType: EAccommodationType) => setAccommodationType(newType)} />
				<Box flex={1}>{accommodationType === EAccommodationType.ALL ? <HomeContent /> : <AccommodationTypeHomeContent type={accommodationType} />}</Box>
			</Box>
		</ThemeProvider>
	);
}
