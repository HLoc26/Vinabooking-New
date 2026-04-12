import * as React from "react";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { IconButton, FormControl, OutlinedInput, InputAdornment, InputLabel, Typography, Box } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function NumberField({ id: idProp, label, error, size = "medium", suffix, step = 1000, value, onValueChange, ...other }: any) {
	const generatedId = React.useId();
	const id = idProp || generatedId;

	// Formatter chuẩn VN
	const formatter = React.useMemo(() => new Intl.NumberFormat("vi-VN"), []);

	// --- CHIÊU QUYẾT ĐỊNH: Dùng state tạm để không bị nhảy số khi gõ ---
	const [tempValue, setTempValue] = React.useState("");

	// Cập nhật tempValue khi props value từ ngoài thay đổi (ví dụ khi nhấn nút tăng/giảm)
	React.useEffect(() => {
		if (value !== undefined) {
			setTempValue(value === 0 ? "" : formatter.format(value));
		}
	}, [value, formatter]);

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const raw = e.target.value.replace(/\./g, ""); // Xóa hết dấu chấm để lấy số thuần
		if (/^\d*$/.test(raw)) {
			// Chỉ cho phép nhập số
			const numeric = Number(raw);
			setTempValue(raw === "" ? "" : formatter.format(numeric));
			onValueChange(numeric);
		}
	};

	return (
		<BaseNumberField.Root id={id} step={step} value={value} onValueChange={onValueChange} {...other}>
			<FormControl size={size} error={error} variant="outlined" fullWidth>
				<InputLabel htmlFor={id}>{label}</InputLabel>
				<OutlinedInput
					id={id}
					label={label}
					value={tempValue}
					onChange={handleInputChange}
					// Chặn các phím không phải số ở tầng bàn phím cho chắc
					onKeyDown={(e) => {
						if (["e", "E", "+", "-", ","].includes(e.key)) e.preventDefault();
					}}
					endAdornment={
						<InputAdornment position="end" sx={{ height: "100%", ml: 0 }}>
							{suffix && (
								<Typography variant="caption" fontWeight={700} sx={{ mr: 1, color: "text.disabled" }}>
									{suffix}
								</Typography>
							)}
							<Box
								display="flex"
								flexDirection="column"
								sx={{
									borderLeft: "1px solid",
									borderColor: "divider",
									height: "calc(100% - 12px)",
									my: 0.75,
								}}
							>
								<BaseNumberField.Increment render={<IconButton size="small" sx={{ p: 0, width: 28, flex: 1 }} />}>
									<KeyboardArrowUpIcon sx={{ fontSize: "1rem" }} />
								</BaseNumberField.Increment>
								<BaseNumberField.Decrement render={<IconButton size="small" sx={{ p: 0, width: 28, flex: 1, borderTop: "1px solid", borderColor: "divider" }} />}>
									<KeyboardArrowDownIcon sx={{ fontSize: "1rem" }} />
								</BaseNumberField.Decrement>
							</Box>
						</InputAdornment>
					}
					sx={{
						fontWeight: 700,
						"& .MuiOutlinedInput-input": { py: size === "small" ? 1 : 1.5 },
					}}
				/>
			</FormControl>
		</BaseNumberField.Root>
	);
}
