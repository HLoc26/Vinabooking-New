import React from "react";
import { Box, Container, Grid, Typography, Link, IconButton } from "@mui/material";
import FacebookIcon from "@mui/icons-material/Facebook";
import InstagramIcon from "@mui/icons-material/Instagram";
import XIcon from "@mui/icons-material/X";
import TravelExploreIcon from "@mui/icons-material/TravelExplore";

const Footer: React.FC = () => {
	return (
		<Box sx={{ backgroundColor: "#f8f8f8", mt: 8, pt: 6, pb: 4, borderTop: "1px solid #e0e0e0" }}>
			<Container maxWidth="lg">
				<Grid container spacing={4}>
					{/* BRAND */}
					<Grid size={{ xs: 12, md: 3 }}>
						<Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
							<TravelExploreIcon sx={{ fontSize: 32 }} />
							<Typography variant="h6" sx={{ fontWeight: 700 }}>
								VinaBooking
							</Typography>
						</Box>
						<Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
							Find your perfect stay across Vietnam — hotels, resorts, villas, and more.
						</Typography>

						<Box sx={{ display: "flex", gap: 1, mt: 2 }}>
							<IconButton size="small">
								<FacebookIcon />
							</IconButton>
							<IconButton size="small">
								<InstagramIcon />
							</IconButton>
							<IconButton size="small">
								<XIcon />
							</IconButton>
						</Box>
					</Grid>

					{/* COMPANY */}
					<Grid size={{ xs: 6, md: 3 }}>
						<Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
							Company
						</Typography>

						<Link href="/about" underline="none" color="text.secondary" display="block" sx={{ mb: 0.7 }}>
							About Us
						</Link>
						<Link href="/contact" underline="none" color="text.secondary" display="block" sx={{ mb: 0.7 }}>
							Contact
						</Link>
					</Grid>

					{/* SUPPORT */}
					<Grid size={{ xs: 6, md: 3 }}>
						<Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
							Support
						</Typography>

						<Link href="/help" underline="none" color="text.secondary" display="block" sx={{ mb: 0.7 }}>
							Help Center
						</Link>
						<Link href="/terms" underline="none" color="text.secondary" display="block" sx={{ mb: 0.7 }}>
							Terms & Conditions
						</Link>
						<Link href="/privacy" underline="none" color="text.secondary" display="block" sx={{ mb: 0.7 }}>
							Privacy Policy
						</Link>
					</Grid>

					{/* POPULAR LOCATIONS */}
					<Grid size={{ xs: 12, md: 3 }}>
						<Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
							Popular Locations
						</Typography>

						{["Hanoi", "Ho Chi Minh", "Da Nang", "Nha Trang", "Da Lat"].map((c) => (
							<Link key={c} href={`/search?city=${c}`} underline="none" color="text.secondary" display="block" sx={{ mb: 0.7 }}>
								{c}
							</Link>
						))}
					</Grid>
				</Grid>

				{/* COPYRIGHT */}
				<Box sx={{ mt: 4, textAlign: "center", color: "text.secondary" }}>
					<Typography variant="body2">© {new Date().getFullYear()} VinaBooking. All rights reserved.</Typography>
				</Box>
			</Container>
		</Box>
	);
};

export default Footer;
