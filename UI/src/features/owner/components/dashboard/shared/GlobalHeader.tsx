import { Box, Typography, Chip, Button, Tooltip } from "@mui/material";
import { CopyAll, OpenInNew, Share, Circle } from "@mui/icons-material";
import { formatDate } from "../../../../../utils/dateFormatter";
import { usePushNotificationContext } from "../../../../../context/PushNotification/hook";
import type { AccommodationSummary } from "../../../types/owner.types";

interface GlobalHeaderProps {
	accommodation: AccommodationSummary;
}

export const GlobalHeader = ({ accommodation }: GlobalHeaderProps) => {
	const { pushNotification } = usePushNotificationContext();

	const handleCopyId = () => {
		navigator.clipboard.writeText(accommodation.id);
		pushNotification("Accommodation ID copied to clipboard!", "success");
	};

	const handleShare = () => {
		const url = `${globalThis.location.origin}/accommodation/${accommodation.id}`;
		navigator.clipboard.writeText(url);
		pushNotification("Public link copied to clipboard!", "success");
	};

	const statusColorMap: Record<string, "default" | "success" | "warning" | "error"> = {
		DRAFT: "default",
		PUBLISHED: "success",
		HIDDEN: "warning",
		BANNED: "error",
	};

	const formattedLastUpdated = accommodation.updatedAt ? formatDate(accommodation.updatedAt) : "Unknown";

	return (
		<Box sx={{ mb: 4, display: "flex", flexDirection: "column", gap: 2 }}>
			{/* HERO BANNER */}
			<Box
				sx={{
					width: "100%",
					height: 200,
					borderRadius: 3,
					bgcolor: "action.hover",
					backgroundImage: `url(${accommodation.thumbnail || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80"})`,
					backgroundSize: "cover",
					backgroundPosition: "center",
					position: "relative",
					border: "1px solid rgba(255,255,255,0.05)",
				}}
			/>

			{/* INFO & ACTIONS */}
			<Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
				<Box>
					<Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
						<Typography variant="h4" fontWeight={800} color="text.primary">
							{accommodation.name}
						</Typography>
						<Chip
							size="small"
							label={accommodation.status}
							color={statusColorMap[accommodation.status] || "default"}
							icon={<Circle sx={{ fontSize: "8px !important" }} />}
							sx={{ fontWeight: 600, height: 24 }}
						/>
					</Box>

					<Box sx={{ display: "flex", alignItems: "center", gap: 2, color: "text.secondary" }}>
						<Tooltip title="Click to copy ID" placement="bottom" arrow>
							<Typography variant="caption" sx={{ display: "flex", alignItems: "center", gap: 0.5, cursor: "pointer", "&:hover": { color: "primary.main" } }} onClick={handleCopyId}>
								ID: {accommodation.id.split("-")[0]}... <CopyAll fontSize="inherit" />
							</Typography>
						</Tooltip>
						<Typography variant="caption">•</Typography>
						<Typography variant="caption">Last updated {formattedLastUpdated}</Typography>
					</Box>
				</Box>

				<Box sx={{ display: "flex", gap: 1 }}>
					<Button
						variant="outlined"
						size="small"
						startIcon={<Share fontSize="small" />}
						onClick={handleShare}
						sx={{
							borderRadius: 2,
							textTransform: "none",
							fontWeight: 600,
							color: "text.primary",
							borderColor: "rgba(255,255,255,0.2)",
							"&:hover": { borderColor: "rgba(255,255,255,0.5)", bgcolor: "rgba(255,255,255,0.05)" },
						}}
					>
						Share
					</Button>
					<Button
						variant="contained"
						color="primary"
						size="small"
						startIcon={<OpenInNew fontSize="small" />}
						onClick={() => globalThis.open(`/accommodation/${accommodation.id}`, "_blank")}
						sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
					>
						View as Guest
					</Button>
				</Box>
			</Box>
		</Box>
	);
};
