import React, { useState } from "react";
import { Box, Container, Typography, TextField, Button, Paper, Stack, InputAdornment, CircularProgress } from "@mui/material";
import { useNavigate } from "react-router-dom";
import BusinessRoundedIcon from "@mui/icons-material/BusinessRounded";
import PhoneRoundedIcon from "@mui/icons-material/PhoneRounded";
import ReceiptRoundedIcon from "@mui/icons-material/ReceiptRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";
import { useUpgradeToOwner } from "../hooks/useUpgradeToOwner";

const OwnerOnboardPage: React.FC = () => {
	const navigate = useNavigate();
	const { mutate: upgradeToOwner, isPending } = useUpgradeToOwner();

	const [formData, setFormData] = useState({
		businessName: "",
		taxId: "",
		contactPhone: "",
	});

	// Mở rộng state lỗi cho cả 3 trường
	const [errors, setErrors] = useState({
		contactPhone: false,
		businessName: false,
		taxId: false,
	});

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));

		// Xóa lỗi tương ứng khi user bắt đầu gõ lại vào field đó
		if (errors[name as keyof typeof errors]) {
			setErrors((prev) => ({ ...prev, [name]: false }));
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();

		// Frontend Validation: Kiểm tra cả 3 trường
		let hasError = false;
		const newErrors = { contactPhone: false, businessName: false, taxId: false };

		if (!formData.contactPhone.trim()) {
			newErrors.contactPhone = true;
			hasError = true;
		}
		if (!formData.businessName.trim()) {
			newErrors.businessName = true;
			hasError = true;
		}
		if (!formData.taxId.trim()) {
			newErrors.taxId = true;
			hasError = true;
		}

		// Nếu có bất kỳ lỗi nào, cập nhật state và dừng submit
		if (hasError) {
			setErrors(newErrors);
			return;
		}

		// Gọi Mutation (Không cần ép về undefined nữa vì chắc chắn đã có chữ)
		upgradeToOwner(
			{
				contactPhone: formData.contactPhone.trim(),
				businessName: formData.businessName.trim(),
				taxId: formData.taxId.trim(),
			},
			{
				onSuccess: () => {
					navigate("/owner/home", { replace: true });
				},
			}
		);
	};

	return (
		<Box
			sx={{
				bgcolor: "background.default",
				minHeight: "100vh",
				display: "flex",
				alignItems: "center",
				py: 8,
			}}
		>
			<Container maxWidth="sm">
				<Paper
					elevation={0}
					sx={{
						p: { xs: 4, md: 6 },
						borderRadius: 4,
						border: "1px solid rgba(0,0,0,0.08)",
						boxShadow: "0 10px 40px rgba(0,0,0,0.03)",
					}}
				>
					<Box textAlign="center" mb={5}>
						<Box
							sx={{
								width: 64,
								height: 64,
								bgcolor: "rgba(245,166,35,0.1)",
								borderRadius: "50%",
								display: "flex",
								alignItems: "center",
								justifyContent: "center",
								margin: "0 auto",
								mb: 2,
							}}
						>
							<CheckCircleOutlineRoundedIcon sx={{ fontSize: 32, color: "#f5a623" }} />
						</Box>
						<Typography variant="h4" fontWeight={800} color="text.primary" gutterBottom>
							Almost there!
						</Typography>
						<Typography color="text.secondary" sx={{ fontSize: "1.05rem" }}>
							Please provide a few details to finalize your Host profile and start accepting bookings.
						</Typography>
					</Box>

					<form onSubmit={handleSubmit}>
						<Stack spacing={3.5}>
							<TextField
								fullWidth
								label="Contact Phone *"
								name="contactPhone"
								value={formData.contactPhone}
								onChange={handleChange}
								placeholder="e.g. 0901234567"
								error={errors.contactPhone}
								helperText={errors.contactPhone ? "Contact phone is required." : "We'll use this to contact you about bookings."}
								slotProps={{
									input: {
										startAdornment: (
											<InputAdornment position="start">
												<PhoneRoundedIcon sx={{ color: errors.contactPhone ? "error.main" : "text.secondary" }} />
											</InputAdornment>
										),
									},
								}}
							/>

							<TextField
								fullWidth
								label="Business / Company Name *"
								name="businessName"
								value={formData.businessName}
								onChange={handleChange}
								placeholder="e.g. Vinabooking Hotel"
								error={errors.businessName}
								helperText={errors.businessName ? "Business name is required." : "The official name of your accommodation or company."}
								slotProps={{
									input: {
										startAdornment: (
											<InputAdornment position="start">
												<BusinessRoundedIcon sx={{ color: errors.businessName ? "error.main" : "text.secondary" }} />
											</InputAdornment>
										),
									},
								}}
							/>

							<TextField
								fullWidth
								label="Tax ID *"
								name="taxId"
								value={formData.taxId}
								onChange={handleChange}
								placeholder="Enter your business tax code"
								error={errors.taxId}
								helperText={errors.taxId ? "Tax ID is required." : "Required for billing and invoicing purposes."}
								slotProps={{
									input: {
										startAdornment: (
											<InputAdornment position="start">
												<ReceiptRoundedIcon sx={{ color: errors.taxId ? "error.main" : "text.secondary" }} />
											</InputAdornment>
										),
									},
								}}
							/>

							<Box pt={2}>
								<Button
									fullWidth
									type="submit"
									variant="contained"
									size="large"
									disabled={isPending}
									sx={{
										py: 1.8,
										fontSize: "1.05rem",
										fontWeight: 700,
										borderRadius: 2,
										background: "linear-gradient(135deg, #f5a623, #e8942a)",
										color: "#080d1a",
										"&:hover": {
											background: "linear-gradient(135deg, #f7b73a, #f5a623)",
											boxShadow: "0 8px 24px rgba(245,166,35,0.4)",
										},
									}}
								>
									{isPending ? <CircularProgress size={26} sx={{ color: "#080d1a" }} /> : "Complete Setup & Go to Dashboard"}
								</Button>
							</Box>
						</Stack>
					</form>

					<Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={4} sx={{ opacity: 0.8 }}>
						By completing this setup, you agree to our Terms of Service and Privacy Policy for Partners.
					</Typography>
				</Paper>
			</Container>
		</Box>
	);
};

export default OwnerOnboardPage;
