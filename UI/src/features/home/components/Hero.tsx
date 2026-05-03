import React from "react";
import { Box, Typography } from "@mui/material";
import { ACCOMMODATION_LABELS, ACCOMMODATION_QUOTES, ACCOMMODATION_HERO_IMAGES } from "../constants/Const";
import SearchBar from "../../accommodation/components/search/SearchBar/SearchBar";
import { EAccommodationType } from "../../accommodation/types/accommodation.types";
import { AdvancedSearchButton } from "../../search/semantic-search/AdvancedSearchButton";

interface HeroProps {
	currentType: EAccommodationType;
	onTypeChange: (type: EAccommodationType) => void;
}

export const Hero: React.FC<HeroProps> = ({ currentType }) => {
	return (
		<Box position="relative" sx={{ minHeight: { xs: 650, lg: 750 }, display: "flex", flexDirection: "column" }}>
			{/* Backgrounds */}
			{Object.values(EAccommodationType).map((type) => (
				<Box
					key={type}
					position="absolute"
					sx={{
						inset: 0,
						backgroundImage: `url(${ACCOMMODATION_HERO_IMAGES[type]})`,
						backgroundSize: "cover",
						backgroundPosition: "center",
						zIndex: 0,
						opacity: currentType === type ? 1 : 0,
						transition: "opacity 1.2s ease-in-out",
					}}
				/>
			))}

			<Box position="absolute" sx={{ inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.5) 100%)", zIndex: 1 }} />

			{/* Title */}
			<Box position="relative" zIndex={5} textAlign="center" px={2} mt={8} maxWidth={900} mx="auto" pb={12}>
				<Typography
					variant="h2"
					fontWeight={800}
					color="white"
					mb={3}
					sx={{ fontSize: { xs: "2.5rem", md: "3.5rem", lg: "4rem" }, textShadow: "0px 4px 12px rgba(0,0,0,0.3)", lineHeight: 1.1 }}
				>
					Find the perfect{" "}
					<Box component="span" color="secondary.main" sx={{ position: "relative", display: "inline-block" }}>
						{ACCOMMODATION_LABELS[currentType]}
						<Box
							component="svg"
							viewBox="0 0 200 9"
							sx={{ position: "absolute", bottom: -5, left: 0, width: "100%", height: 12, fill: "none", stroke: "#f97316", strokeWidth: 4, opacity: 0.8 }}
						>
							<path d="M2.00025 6.99997C38.5002 3.00004 150.001 -2.00002 198 3.99999" />
						</Box>
					</Box>
					<br className="hidden md:block" /> on VinaBooking.com
				</Typography>
				<Typography variant="h6" color="rgba(255,255,255,0.9)" fontWeight={400}>
					{ACCOMMODATION_QUOTES[currentType]}
				</Typography>
			</Box>

			<SearchBar />
			
			<Box position="relative" zIndex={5} display="flex" justifyContent="center" mt={4}>
				<AdvancedSearchButton />
			</Box>
		</Box>
	);
};
