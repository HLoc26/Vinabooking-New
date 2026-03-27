import { Box, Typography, Paper, Stack } from "@mui/material";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import ApartmentOutlinedIcon from "@mui/icons-material/ApartmentOutlined";
import CabinOutlinedIcon from "@mui/icons-material/CabinOutlined";
import { ERentalType } from "../../../../accommodation/types/accommodation.types";

const options = [
	{
		value: ERentalType.ENTIRE_PLACE,
		label: "Entire place",
		desc: "Entire place like a house, homestay or even apartment",
		icon: HomeOutlinedIcon,
	},
	{
		value: ERentalType.PRIVATE_ROOM,
		label: "Private room",
		desc: "Private room, like a hotel, flat, guesthouse, where you can rent out the place but not entire place",
		icon: ApartmentOutlinedIcon,
	},
	{
		value: ERentalType.SHARED_ROOM,
		label: "Shared room",
		desc: "Shared room like capsule hotel, or other unique places",
		icon: CabinOutlinedIcon,
	},
] as const;

interface Props {
	value: ERentalType | "";
	onChange: (val: ERentalType) => void;
}

export default function StepRentalTypeBox({ value, onChange }: Props) {
	return (
		<Box>
			<Typography variant="h6" mb={3}>
				What type of accommodation are you listing?
			</Typography>

			<Stack spacing={2}>
				{options.map((opt) => {
					const selected = value === opt.value;
					const Icon = opt.icon;

					return (
						<Paper
							key={opt.value}
							onClick={() => onChange(opt.value)}
							elevation={selected ? 4 : 1}
							sx={{
								p: 3,
								borderRadius: 3,
								cursor: "pointer",
								border: "2px solid",
								borderColor: selected ? "#1976d2" : "transparent",
								bgcolor: selected ? "rgba(25, 118, 210, 0.05)" : "background.paper",
								transition: "all 0.25s ease",
								display: "flex",
								gap: 2,
								alignItems: "flex-start",
								"&:hover": {
									borderColor: "#1976d2",
									boxShadow: 3,
									bgcolor: "rgba(25, 118, 210, 0.04)",
								},
							}}
						>
							<Box
								sx={{
									mt: 0.5,
									color: selected ? "primary.main" : "text.secondary",
									transition: "color 0.25s ease",
								}}
							>
								<Icon fontSize="medium" />
							</Box>

							<Box>
								<Typography variant="subtitle1" fontWeight={selected ? 700 : 600} color={selected ? "primary.main" : "text.primary"} sx={{ transition: "all 0.25s ease" }}>
									{opt.label}
								</Typography>
								<Typography variant="body2" color="text.secondary">
									{opt.desc}
								</Typography>
							</Box>
						</Paper>
					);
				})}
			</Stack>
		</Box>
	);
}
