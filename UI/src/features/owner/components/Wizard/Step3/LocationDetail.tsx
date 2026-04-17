import { TextField, Grid, Box, Typography } from "@mui/material";

interface LocationDetailsProps {
	address: {
		street: string;
		city: string;
		country: string;
	};
	onChange: (data: any) => void;
}

export default function LocationDetails({ address, onChange }: LocationDetailsProps) {
	// Internal helper to update specific fields manually if the user wants to tweak them
	const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
		onChange({ [field]: e.target.value });
	};

	return (
		<Box sx={{ mt: 2 }}>
			<Typography variant="subtitle2" color="textSecondary" gutterBottom>
				Verified Location Details
			</Typography>
			<Grid container rowSpacing={2} columnSpacing={{ xs: 1, sm: 2, md: 3 }} sx={{ width: "100%" }}>
				<Grid size={{ xs: 12, sm: 6 }}>
					<TextField fullWidth label="Street / House Number" value={address.street || ""} onChange={handleChange("street")} />
				</Grid>
				<Grid size={{ xs: 12, sm: 6 }}>
					<TextField fullWidth label="City / Province" value={address.city || ""} onChange={handleChange("city")} />
				</Grid>
				<Grid size={{ xs: 12 }}>
					<TextField fullWidth label="Country" value={address.country || ""} onChange={handleChange("country")} />
				</Grid>
			</Grid>
		</Box>
	);
}
