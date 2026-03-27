import { Dialog, DialogTitle, DialogContent, IconButton, Typography, Stack, Box, TextField, Button, Chip, Divider } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import type { AmenityConfigForm } from "../../../types/owner.types";

interface Props {
	open: boolean;
	amenities: AmenityConfigForm[];
	onClose: () => void;
	onUpdate: (amenityId: string, patch: Partial<AmenityConfigForm>) => void;
	onRemove: (amenityId: string) => void;
}

export default function AmenityPanel({ open, amenities, onClose, onUpdate, onRemove }: Props) {
	return (
		<Dialog
			open={open}
			onClose={onClose}
			hideBackdrop
			disableEnforceFocus
			disableScrollLock
			PaperProps={{
				onClick: (e) => e.stopPropagation(),
				sx: {
					width: 300,
					maxWidth: 300,
					m: 0,
					borderRadius: 3,
					boxShadow: 6,
				},
			}}
			sx={{
				zIndex: 1400,
				pointerEvents: "none",
				"& .MuiDialog-container": {
					alignItems: "center",
					justifyContent: "flex-start",
					pl: "calc(50vw + 450px + 16px)",
				},
				"& .MuiPaper-root": {
					pointerEvents: "auto",
				},
			}}
		>
			<DialogTitle
				sx={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					pb: 1,
					borderBottom: "1px solid",
					borderColor: "divider",
				}}
			>
				<Box display="flex" alignItems="center" gap={1}>
					<CheckCircleIcon sx={{ fontSize: 18, color: "primary.main" }} />
					<Typography variant="subtitle1" fontWeight={700}>
						Selected Amenities
					</Typography>
					<Chip label={amenities.length} size="small" color="primary" sx={{ height: 18, fontSize: 11, minWidth: 24 }} />
				</Box>
				<IconButton size="small" onClick={onClose}>
					<CloseIcon fontSize="small" />
				</IconButton>
			</DialogTitle>

			<DialogContent sx={{ px: 2, py: 1.5 }}>
				{amenities.length === 0 ? (
					<Typography variant="body2" color="text.disabled" textAlign="center" py={3}>
						Click a chip in the room editor to add an amenity.
					</Typography>
				) : (
					<Stack spacing={1.5} divider={<Divider />}>
						{amenities.map((a) => (
							<Box key={a.amenityId} pt={0.5}>
								<Box display="flex" justifyContent="space-between" alignItems="center" mb={0.75}>
									<Typography variant="body2" fontWeight={600}>
										{a.name}
									</Typography>
									<Button
										size="small"
										color="error"
										startIcon={<DeleteOutlineIcon sx={{ fontSize: "14px !important" }} />}
										onClick={() => onRemove(a.amenityId)}
										sx={{ fontSize: 11, px: 1, minWidth: 0 }}
									>
										Remove
									</Button>
								</Box>
								<TextField
									fullWidth
									size="small"
									label="Note (optional)"
									value={a.note ?? ""}
									onChange={(e) => onUpdate(a.amenityId, { note: e.target.value })}
									multiline
									minRows={1}
									maxRows={3}
								/>
							</Box>
						))}
					</Stack>
				)}
			</DialogContent>
		</Dialog>
	);
}
