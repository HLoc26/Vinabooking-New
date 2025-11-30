import { Box, Button, Container, Paper, Typography } from "@mui/material";
import HorizontalList from "./HorizontalList";
import CityCard from "./CityCard";
import useStats from "../context/StatsContext/hook";
import { CITIES } from "../constants/CityConst";
import { ACCOMMODATION_TYPES } from "../constants/AccommodationTypeConst";
import TypeCard from "./TypeCard";
import FAQ from "./FAQ";
import type { City } from "../types/City";

const HomeContent: React.FC = () => {
	const { cities } = useStats(); // TODO: Add loading and skeleton

	return (
		<Box flexGrow={1}>
			<Container sx={{ py: 4 }}>
				<HorizontalList
					title="Top places by cities"
					items={cities}
					renderItem={(cityStat) => {
						const fallbackImage = CITIES.find((c) => c.name.toLowerCase() === cityStat.city.toLowerCase())?.imageUrl;
						const imageUrl = fallbackImage || "/images/city/default.jpg";
						const city: City = {
							id: cityStat.city.toLowerCase(),
							name: cityStat.city,
							imageUrl: imageUrl,
							propertyCount: cityStat.count,
						};
						return <CityCard city={city} typeLabel="Accommodation" />;
					}}
				/>
			</Container>

			{/* Types */}
			<Paper elevation={0} sx={{ bgcolor: "#f3f4f6", py: 4 }}>
				<Container>
					<HorizontalList //
						title="Find accommodation by type"
						items={ACCOMMODATION_TYPES}
						renderItem={(type, onClick) => <TypeCard data={type} onClick={onClick} />}
					/>
				</Container>
			</Paper>

			{/* FAQ */}
			<Container sx={{ py: 6 }}>
				<FAQ />
			</Container>

			{/* CTA Banner */}
			<Container sx={{ py: 8 }}>
				<Paper
					sx={{
						p: { xs: 4, md: 8 },
						textAlign: "center",
						borderRadius: 4,
						background: "linear-gradient(to right, #f97316, #ea580c)",
						color: "white",
						position: "relative",
						overflow: "hidden",
					}}
				>
					<Box position="relative" zIndex={10}>
						<Typography variant="h3" fontWeight={700} mb={2}>
							Ready for your next adventure?
						</Typography>
						<Typography variant="h6" mb={4} sx={{ opacity: 0.9 }}>
							Join thousands of travelers finding their perfect stay with Vinabooking.
						</Typography>
						<Button
							variant="contained"
							sx={{
								bgcolor: "white",
								color: "#ea580c",
								fontWeight: 700,
								px: 4,
								py: 1.5,
								borderRadius: 5,
								":hover": { bgcolor: "#fff7f2" },
							}}
						>
							Book Now
						</Button>
					</Box>
				</Paper>
			</Container>
		</Box>
	);
};

export default HomeContent;
