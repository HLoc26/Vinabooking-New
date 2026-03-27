import { Box, Typography, Button } from "@mui/material";
import { Add } from "@mui/icons-material";
import { useNavigate } from "react-router-dom";

export const DashboardHeader = () => {
	const navigate = useNavigate();

	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				mb: 5,
			}}
		>
			<Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
				<Box
					sx={{
						width: 4,
						height: 36,
						background: "linear-gradient(180deg, #f7b740, #e8931a)",
						borderRadius: "9999px",
						boxShadow: "0 0 12px rgba(245,166,35,0.4)",
						flexShrink: 0,
					}}
				/>

				<Typography
					variant="h4"
					component="h1"
					sx={{
						fontWeight: 800,
						letterSpacing: "-0.025em",
						lineHeight: 1.1,
						color: "text.primary",
					}}
				>
					My Accommodations
				</Typography>
			</Box>

			<Button
				variant="contained"
				startIcon={<Add sx={{ fontSize: "1rem" }} />}
				onClick={() => navigate("/owner/drafts")}
				sx={{
					px: 2.5,
					py: 1,
					fontWeight: 700,
					fontSize: "0.875rem",
					borderRadius: "12px",
					color: "#1a1206",
					background: "linear-gradient(135deg, #f7b740 0%, #e8931a 100%)",
					boxShadow: "0 4px 16px rgba(245,166,35,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
					transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
					"&:hover": {
						boxShadow: "0 6px 24px rgba(245,166,35,0.45)",
						transform: "translateY(-2px)",
						background: "linear-gradient(135deg, #f9c355 0%, #f5a623 100%)",
					},
					"&:active": {
						transform: "translateY(0)",
						boxShadow: "0 2px 8px rgba(245,166,35,0.25)",
					},
				}}
			>
				Create New
			</Button>
		</Box>
	);
};
