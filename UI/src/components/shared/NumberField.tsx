import * as React from "react";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { IconButton, FormControl, OutlinedInput, InputAdornment, InputLabel, Typography, Box } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

export default function NumberField({
	id: idProp,
	label,
	error,
	size = "medium",
	suffix,
	step = 1000,
	...other
}: BaseNumberField.Root.Props & {
	label?: string;
	size?: "small" | "medium";
	error?: boolean;
	suffix?: string;
}) {
	const generatedId = React.useId();
	const id = idProp || generatedId;
	const formatter = React.useMemo(() => new Intl.NumberFormat("vi-VN"), []);

	return (
		<BaseNumberField.Root
			{...other}
			id={id}
			step={step}
			render={(props, state) => (
				<FormControl size={size} ref={props.ref} disabled={state.disabled} required={state.required} error={error} variant="outlined" fullWidth>
					{props.children}
				</FormControl>
			)}
		>
			<InputLabel htmlFor={id}>{label}</InputLabel>
			<BaseNumberField.Input
				id={id}
				render={(props, state) => (
					<OutlinedInput
						{...(props as Omit<typeof props, "color">)}
						label={label}
						inputRef={props.ref}
						error={error}
						// Định dạng hiển thị chuẩn VN
						value={state.value != null ? formatter.format(state.value) : state.inputValue}
						onChange={props.onChange}
						onKeyDown={props.onKeyDown}
						onBlur={props.onBlur}
						onFocus={props.onFocus}
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
										height: "calc(100% - 12px)", // Giảm chiều cao để tạo khoảng thở với viền
										my: 0.75, // Căn giữa divider theo chiều dọc
									}}
								>
									<BaseNumberField.Increment render={<IconButton size="small" sx={{ p: 0, flex: 1, borderRadius: 0, width: 28, minHeight: "50%" }} />}>
										<KeyboardArrowUpIcon sx={{ fontSize: "1rem" }} />
									</BaseNumberField.Increment>

									<BaseNumberField.Decrement
										render={
											<IconButton
												size="small"
												sx={{
													p: 0,
													flex: 1,
													borderRadius: 0,
													width: 28,
													minHeight: "50%",
													borderTop: "1px solid",
													borderColor: "divider",
												}}
											/>
										}
									>
										<KeyboardArrowDownIcon sx={{ fontSize: "1rem" }} />
									</BaseNumberField.Decrement>
								</Box>
							</InputAdornment>
						}
						sx={{
							pr: 0.5, // Tạo khoảng cách nhỏ giữa cụm nút và cạnh phải
							fontWeight: 700,
							"& .MuiOutlinedInput-input": {
								py: size === "small" ? 1 : 1.5, // Cân đối lại padding nội dung
							},
						}}
					/>
				)}
			/>
		</BaseNumberField.Root>
	);
}
