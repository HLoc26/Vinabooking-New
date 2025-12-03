import { Box, Paper, Typography, CircularProgress } from "@mui/material";
import { useOAuthCallback } from "../hooks/useOAuthCallback";

export const OAuthErrorPage = () => {
	const { loading, error } = useOAuthCallback();

	return (
		<Box
			sx={{
				display: "flex",
				justifyContent: "center",
				alignItems: "center",
				minHeight: "100vh",
				backgroundColor: "#FFF7ED",
			}}
		>
			<Paper
				elevation={3}
				sx={{
					p: 5,
					borderRadius: "2xl",
					textAlign: "center",
					maxWidth: 480,
				}}
			>
				{loading ? (
					<>
						<CircularProgress color="primary" sx={{ mb: 3 }} />
						<Typography variant="h5" gutterBottom>
							Processing...
						</Typography>
						<Typography variant="body1">Please kindly wait.</Typography>
					</>
				) : (
					<>
						<Typography variant="h5" gutterBottom color="error">
							Failed to log in.
						</Typography>
						<Typography variant="body1">{error}</Typography>
					</>
				)}
			</Paper>
		</Box>
	);
};
