import * as React from "react";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { IconButton, FormControl, OutlinedInput, InputAdornment, InputLabel, Typography, Box } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function NumberField({ id: idProp, label, error, size = "medium", suffix, step = 1000, value, onValueChange, ...other }: any) {
	const generatedId = React.useId();
	const id = idProp || generatedId;
	const formatter = React.useMemo(() => new Intl.NumberFormat("vi-VN"), []);

	const [tempValue, setTempValue] = React.useState("");

	// Đồng bộ giá trị từ ngoài vào (khi bấm nút tăng giảm hoặc reset form)
	React.useEffect(() => {
		if (value !== undefined) {
			setTempValue(value === 0 ? "" : formatter.format(value));
		}
	}, [value, formatter]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value.replace(/\./g, ""); // Xóa dấu chấm để tính toán
		if (/^\d*$/.test(raw)) {
			const numeric = Number(raw);
			setTempValue(raw === "" ? "" : formatter.format(numeric));
			onValueChange(numeric);
		}
	};

	return (
		<BaseNumberField.Root id={id} step={step} value={value} onValueChange={onValueChange} {...other}>
			<FormControl size={size} error={error} variant="outlined" fullWidth>
				{/* 1. Label phải khớp với id của Input */}
				<InputLabel htmlFor={id}>{label}</InputLabel>

				<OutlinedInput
					id={id}
					// 2. Phải có label ở đây thì cái rãnh (notch) trên border mới xuất hiện
					label={label}
					value={tempValue}
					onChange={handleInputChange}
					onKeyDown={(e) => {
						if (["e", "E", "+", "-", ","].includes(e.key)) e.preventDefault();
					}}
					endAdornment={
						<InputAdornment
							position="end"
							sx={{
								height: "100%",
								ml: 0,
								// Ép cụm nút lùi sát về bên phải để không chiếm chỗ của Input
								marginRight: "-14px",
							}}
						>
							{suffix && (
								<Typography variant="caption" fontWeight={700} sx={{ mr: 1, color: "text.disabled", userSelect: "none" }}>
									{suffix}
								</Typography>
							)}
							<Box
								display="flex"
								flexDirection="column"
								sx={{
									borderLeft: "1px solid",
									borderColor: "divider",
									height: "calc(100% + 2px)", // Khít viền
								}}
							>
								<BaseNumberField.Increment render={<IconButton size="small" sx={{ p: 0, width: 32, flex: 1, borderRadius: 0 }} />}>
									<KeyboardArrowUpIcon sx={{ fontSize: "1.1rem" }} />
								</BaseNumberField.Increment>
								<BaseNumberField.Decrement render={<IconButton size="small" sx={{ p: 0, width: 32, flex: 1, borderRadius: 0, borderTop: "1px solid", borderColor: "divider" }} />}>
									<KeyboardArrowDownIcon sx={{ fontSize: "1.1rem" }} />
								</BaseNumberField.Decrement>
							</Box>
						</InputAdornment>
					}
					sx={{
						fontWeight: 700,
						// 3. Ép height chuẩn 56px của MUI Medium
						height: 56,
						"& .MuiOutlinedInput-input": {
							boxSizing: "border-box",
						},
					}}
				/>
			</FormControl>
		</BaseNumberField.Root>
	);
}
