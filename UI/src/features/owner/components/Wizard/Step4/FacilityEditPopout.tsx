import { Box, Typography, Paper, TextField, Button, InputAdornment } from "@mui/material";
import SaveOutlinedIcon from "@mui/icons-material/SaveOutlined";
import type React from "react";
import { EDIT_BG, EDIT_BORDER, EDIT_HOVER, EDIT_SHADOW } from "../../../const/FacilityConst";

interface FacilityEditPopoutProps {
	fee: number;
	onFeeChange: (val: number) => void;
	note: string;
	onNoteChange: (val: string) => void;
	onSave: () => void;
	onCancel: () => void;
}

const FacilityEditPopout: React.FC<FacilityEditPopoutProps> = ({ fee, onFeeChange, note, onNoteChange, onSave, onCancel }) => {
	return (
		<Paper
			className="facility-popout"
			elevation={0}
			sx={{
				position: "absolute",
				top: "calc(100% - 2px)",
				zIndex: 2,
				border: `2px solid ${EDIT_BORDER}`,
				bgcolor: EDIT_BG,
				borderBottomLeftRadius: 12,
				borderBottomRightRadius: 12,
				p: { xs: 2, md: 2.5 },
				boxShadow: `0px 20px 20px 30px ${EDIT_SHADOW}`,
				transformOrigin: "top center",
			}}
			onClick={(e) => e.stopPropagation()}
		>
			<Box display="flex" flexDirection="row" alignItems="center" gap={2}>
				<TextField
					size="small"
					type="number"
					label="Fee"
					placeholder="0 = free"
					value={fee === 0 ? "" : fee}
					onChange={(e) => onFeeChange(Math.max(0, Number(e.target.value)))}
					inputProps={{ min: 0, step: 1000 }}
					slotProps={{
						input: {
							endAdornment: (
								<InputAdornment position="end">
									<Typography variant="caption" color="text.secondary" fontWeight={600}>
										VND
									</Typography>
								</InputAdornment>
							),
						},
					}}
					sx={{ width: { xs: 150, sm: 200 }, flexShrink: 0, "& .MuiOutlinedInput-root": { bgcolor: "background.paper" } }}
				/>

				<TextField
					fullWidth
					size="small"
					label="Note"
					placeholder="e.g. Available 6am–10pm"
					value={note}
					onChange={(e) => onNoteChange(e.target.value)}
					inputProps={{ maxLength: 200 }}
					sx={{ flex: 1, "& .MuiOutlinedInput-root": { bgcolor: "background.paper" } }}
				/>

				<Box display="flex" flexShrink={0} gap={1}>
					<Button
						variant="contained"
						size="small"
						onClick={onSave}
						startIcon={<SaveOutlinedIcon />}
						sx={{ borderRadius: 2, fontWeight: 700, bgcolor: EDIT_BORDER, "&:hover": { bgcolor: EDIT_HOVER } }}
					>
						Save
					</Button>
					<Button
						variant="outlined"
						size="small"
						onClick={onCancel}
						sx={{ borderRadius: 2, borderColor: EDIT_BORDER, color: EDIT_BORDER, "&:hover": { borderColor: EDIT_BORDER, bgcolor: EDIT_HOVER } }}
					>
						Cancel
					</Button>
				</Box>
			</Box>
		</Paper>
	);
};

export default FacilityEditPopout;
