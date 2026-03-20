import { Box, Typography, Grid, Paper, Divider } from "@mui/material";
import { ALL_FACILITIES, type FacilityConfig } from "../../../const/FacilityConst";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export default function StepFacilityBox({ form, setForm }: any) {
	const selectedFacilities = form.facilities || [];
	const selectedIds = selectedFacilities.map((f: any) => f.id);

	const toggleFacility = (facility: FacilityConfig) => {
		const isSelected = selectedIds.includes(facility.id);
		const newFacilities = isSelected
			? selectedFacilities.filter((f: any) => f.id !== facility.id)
			: [
					...selectedFacilities,
					{
						id: facility.id,
						fee: "0",
						note: null,
						name: facility.name,
						type: facility.type,
					},
				];

		setForm((prev: any) => ({ ...prev, facilities: newFacilities }));
	};

	const grouped = ALL_FACILITIES.reduce(
		(acc, curr) => {
			(acc[curr.type] = acc[curr.type] || []).push(curr);
			return acc;
		},
		{} as Record<string, FacilityConfig[]>
	);

	return (
		<Box sx={{ p: 1 }}>
			<Typography variant="h5" fontWeight={800} mb={1} sx={{ color: "#c4b921" }}>
				Select Facilities & Amenities
			</Typography>
			<Typography variant="body2" color="text.secondary" mb={4}>
				Click the tiles below to add them to your property.
			</Typography>

			{Object.entries(grouped).map(([type, items]) => (
				<Box key={type} mb={5}>
					{/* ✅ Section Header: Deep Indigo Color */}
					<Typography
						variant="subtitle2"
						sx={{
							fontWeight: 800,
							color: "#ffffff", // Indigo accent for headers
							letterSpacing: 1.5,
							textTransform: "uppercase",
							mb: 1,
						}}
					>
						{type.replace(/_/g, " ")}
					</Typography>
					<Divider sx={{ mb: 3, borderColor: "#3f51b5", opacity: 0.2 }} />

					<Grid container spacing={2}>
						{items.map((facility) => {
							const isSelected = selectedIds.includes(facility.id);
							const Icon = facility.icon;

							return (
								<Grid item xs={6} sm={4} md={3} key={facility.id}>
									<Paper
										onClick={() => toggleFacility(facility)}
										elevation={0}
										sx={{
											p: 3,
											display: "flex",
											flexDirection: "column",
											alignItems: "center",
											cursor: "pointer",
											borderRadius: 3,
											position: "relative",
											transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",

											// Charcoal Theme Logic
											border: "2px solid",
											borderColor: isSelected ? "#1a1a1a" : "#eeeeee",
											bgcolor: isSelected ? "#1a1a1a" : "#fdfdfd",
											color: isSelected ? "#ffffff" : "#424242",

											"&:hover": {
												transform: "translateY(-6px)",
												boxShadow: isSelected ? "0 10px 20px rgba(0,0,0,0.3)" : "0 10px 20px rgba(0,0,0,0.05)",
												borderColor: "#1a1a1a",
												bgcolor: isSelected ? "#333333" : "#ffffff",
											},
										}}
									>
										{/* Success Checkmark */}
										{isSelected && (
											<CheckCircleIcon
												sx={{
													position: "absolute",
													top: 10,
													right: 10,
													fontSize: 18,
													color: "#ffffff", // Green success pop
												}}
											/>
										)}

										<Icon
											sx={{
												fontSize: 38,
												mb: 1.5,
												color: isSelected ? "#ffffff" : "#757575",
											}}
										/>

										<Typography
											variant="body2"
											sx={{
												fontWeight: isSelected ? 800 : 600,
												textAlign: "center",
												fontSize: "0.85rem",
											}}
										>
											{facility.name}
										</Typography>
									</Paper>
								</Grid>
							);
						})}
					</Grid>
				</Box>
			))}
		</Box>
	);
}
