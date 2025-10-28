import React, { useRef, useState } from "react";
import { Box, TextField } from "@mui/material";

interface OtpInputProps {
	length?: number;
	onChange?: (otp: string) => void;
}

const OtpInput: React.FC<OtpInputProps> = ({ length = 6, onChange }) => {
	const [otp, setOtp] = useState<string[]>(Array(length).fill(""));
	const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

	const handleChange = (value: string, index: number) => {
		if (!/^[0-9]?$/.test(value)) return; // chỉ cho phép số
		const newOtp = [...otp];
		newOtp[index] = value;
		setOtp(newOtp);
		onChange?.(newOtp.join(""));

		if (value && index < length - 1) {
			inputsRef.current[index + 1]?.focus();
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>, index: number) => {
		if (e.key === "Backspace" && !otp[index] && index > 0) {
			inputsRef.current[index - 1]?.focus();
		}
	};

	const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
		e.preventDefault();
		const pasted = e.clipboardData.getData("text").slice(0, length).split("");
		const newOtp = Array(length)
			.fill("")
			.map((_, i) => pasted[i] || "");
		setOtp(newOtp);
		onChange?.(newOtp.join(""));
	};

	return (
		<Box display="flex" gap={1} justifyContent="center">
			{otp.map((value, index) => (
				<TextField
					key={index}
					value={value}
					inputRef={(el) => (inputsRef.current[index] = el)}
					onChange={(e) => handleChange(e.target.value, index)}
					onKeyDown={(e) => handleKeyDown(e, index)}
					onPaste={handlePaste}
					slotProps={{
						input: {
							style: {
								textAlign: "center",
								fontSize: "1.5rem",
								width: "2.5rem",
								height: "3rem",
							},
						},
					}}
					variant="outlined"
				/>
			))}
		</Box>
	);
};

export default OtpInput;
