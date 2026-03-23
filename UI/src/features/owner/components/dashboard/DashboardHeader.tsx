import { Box, Typography, Button } from "@mui/material";
import { Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export const DashboardHeader = () => {
	const navigate = useNavigate();

	return (
		<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4 }}>
			<Typography variant="h4" component="h1" color="text.primary">
				My Accommodations
			</Typography>
			<Button
				variant="contained"
				color="primary"
				startIcon={<Add />}
				onClick={() => navigate("/owner/drafts")}
				sx={{
					boxShadow: "0 4px 14px 0 rgba(245, 166, 35, 0.39)",
					"&:hover": {
						boxShadow: "0 6px 20px rgba(245, 166, 35, 0.23)",
					},
				}}
			>
				Create New
			</Button>
		</Box>
	);
};
