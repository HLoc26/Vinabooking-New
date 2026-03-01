import React from "react";
import { Box, Typography, Popper, Paper, Stack, Fade } from "@mui/material";
import DoneIcon from "@mui/icons-material/Done";
import CloseIcon from "@mui/icons-material/Close";
import type { PasswordChecklist } from "../../features/auth/utils/validatePassword";

interface PasswordToolboxProps {
	anchorEl: HTMLElement | null;
	open: boolean;
	checklist: PasswordChecklist;
}

const PasswordToolbox: React.FC<PasswordToolboxProps> = ({ anchorEl, open, checklist }) => {
	const items = [
		{ label: "At least 8 characters", valid: checklist.length },
		{ label: "One uppercase letter", valid: checklist.upper },
		{ label: "One lowercase letter", valid: checklist.lower },
		{ label: "One number", valid: checklist.number },
		{ label: "One special character", valid: checklist.special },
	];

	return (
		<Popper
			open={open}
			anchorEl={anchorEl}
			placement="right-start"
			transition
			modifiers={[{ name: "offset", options: { offset: [10, 12] } }]}
			sx={{ filter: "drop-shadow(0 0 2px rgba(0,0,0,0.2))" }}
		>
			{({ TransitionProps }) => (
				<Fade {...TransitionProps} timeout={150}>
					<Box sx={{ position: "relative", display: "inline-block" }}>
						{/* Arrow bên phải */}
						<Box
							sx={{
								position: "absolute",
								left: -7,
								top: 16,
								width: 0,
								height: 0,
								borderTop: "8px solid transparent",
								borderBottom: "8px solid transparent",
								borderRight: (theme) => `8px solid ${theme.palette.background.paper}`,
								filter: "drop-shadow(-2px 0 2px rgba(0,0,0,0.2))",
								zIndex: 1,
							}}
						/>

						{/* Nội dung chính */}
						<Paper
							sx={{
								p: 2,
								borderRadius: 2,
								boxShadow: 4,
								bgcolor: "background.paper",
								minWidth: 260,
								zIndex: 2,
							}}
						>
							<Typography variant="subtitle2" fontWeight={600} mb={1}>
								Password requirements
							</Typography>
							<Stack spacing={0.5}>
								{items.map((item) => (
									<Box key={item.label} display="flex" alignItems="center" gap={1}>
										<Typography //
											variant="body2"
											color={item.valid ? "success.main" : "text.secondary"}
											display="flex"
											alignItems="center"
										>
											{item.valid ? <DoneIcon /> : <CloseIcon />}
											{item.label}
										</Typography>
									</Box>
								))}
							</Stack>
						</Paper>
					</Box>
				</Fade>
			)}
		</Popper>
	);
};

export default PasswordToolbox;
