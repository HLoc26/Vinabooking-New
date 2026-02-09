import { Paper, Typography, Grid, Box } from "@mui/material";
import { facilityIcons } from "../../../../../constants/facilityIcons";
import type { AccommodationDetail } from "../../../../../types/accommodation.types";

interface Props {
	accommodation: AccommodationDetail;
}

export const FacilitiesSection = ({ accommodation }: Props) => {
	return (
		<Paper sx={{ p: 4, mb: 3, borderRadius: 2, border: "1px solid", borderColor: "divider", boxShadow: "none" }}>
			<Typography variant="h6" fontWeight="600" sx={{ mb: 3 }}>
				Facilities & Services
			</Typography>

			<Grid container spacing={2}>
				{accommodation.facilities.map((f) => (
					<Grid size={{ xs: 12, sm: 6, md: 4 }} key={f.id}>
						<Box
							sx={{
								p: 2,
								borderRadius: 1.5,
								bgcolor: "grey.50",
								height: "100%",
								display: "flex",
								gap: 1.5,
								"&:hover": { bgcolor: "grey.100" },
							}}
						>
							<Box sx={{ color: "primary.main", pt: 0.25 }}>{facilityIcons[f.type] || facilityIcons.DEFAULT}</Box>
							<Box>
								<Box sx={{ display: "flex", justifyContent: "space-between", gap: 1.5, mb: f.note ? 0.5 : 0 }}>
									<Typography variant="body2" fontWeight="500">
										{f.name}
									</Typography>
									{parseFloat(f.fee) > 0 && (
										<Typography variant="caption" fontWeight="700" color="primary.main">
											${f.fee}
										</Typography>
									)}
								</Box>
								{f.note && (
									<Typography variant="caption" color="text.secondary">
										{f.note}
									</Typography>
								)}
							</Box>
						</Box>
					</Grid>
				))}
			</Grid>
		</Paper>
	);
};
