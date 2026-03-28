import { Box, Typography, Button } from "@mui/material";
import { DomainAddOutlined } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export const EmptyState = () => {
	const navigate = useNavigate();

	return (
		<Box
			sx={{
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				py: 10,
				px: 3,
				textAlign: "center",
				backgroundColor: "background.paper",
				borderRadius: 4,
				border: "2px dashed rgba(255,255,255,0.1)",
			}}
		>
			<DomainAddOutlined sx={{ fontSize: 80, color: "text.secondary", mb: 2, opacity: 0.5 }} />
			<Typography variant="h5" color="text.primary" gutterBottom>
				You don't have any active accommodations yet
			</Typography>
			<Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 500 }}>
				Start your hosting journey and increase your revenue by creating your first accommodation profile today.
			</Typography>
			<Button variant="outlined" color="primary" onClick={() => navigate("/owner/drafts")}>
				Start Setup
			</Button>
		</Box>
	);
};
