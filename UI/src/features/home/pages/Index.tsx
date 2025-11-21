import Hero from "../components/Hero";
import HorizontalList from "../components/HorizontalList";
import CityCard from "../components/CityCard";
import TypeCard from "../components/TypeCard";
import FAQ from "../components/FAQ";
import { FAQS } from "../constants/FAQConst";
import { Container, Box, Typography, Button, Paper } from "@mui/material";
import { CITIES } from "../constants/CityConst";
import { ACCOMMODATION_TYPES } from "../constants/AccommodationTypeConst";

export function HomePage() {
	return (
		<Box minHeight="100vh" display="flex" flexDirection="column" bgcolor="#f9fafb">
			{/* Hero Section */}
			<Hero />

			{/* Main Content */}
			<Box flexGrow={1}>
				<Container sx={{ py: 4 }}>
					{/* Cities */}
					<HorizontalList title="Top places by cities" items={CITIES} renderItem={(city) => <CityCard data={city} />} onSeeAll={() => console.log("See all cities")} />
				</Container>

				{/* Types */}
				<Paper elevation={0} sx={{ bgcolor: "#f3f4f6", py: 4 }}>
					<Container>
						<HorizontalList title="Find accommodation by type" items={ACCOMMODATION_TYPES} renderItem={(type, onClick) => <TypeCard data={type} onClick={onClick} />} />
					</Container>
				</Paper>

				{/* FAQ */}
				<Container sx={{ py: 6 }}>
					<FAQ items={FAQS} />
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
		</Box>
	);
}
