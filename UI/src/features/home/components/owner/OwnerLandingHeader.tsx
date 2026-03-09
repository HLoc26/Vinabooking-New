import React, { useState, useEffect } from "react";
import { Box, Container, Typography, Button, Stack } from "@mui/material";
import LoginModal from "../../../../components/shared/LoginModal.tsx";
import AddHomeWorkRoundedIcon from "@mui/icons-material/AddHomeWorkRounded";
import useModalContext from "../../../../context/ModalContext/hook.ts";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../../app/store";

// Note: Ensure this relative path matches your folder structure
import { useOwnerInfo } from "../../../owner/hooks/useOwnerInfo";

const OwnerLandingHeader: React.FC = () => {
	const [scrolled, setScrolled] = useState(false);
	const navigate = useNavigate();
	const { openModal, closeModal } = useModalContext();

	const user = useSelector((state: RootState) => state.auth.user);
	const { data: ownerInfo } = useOwnerInfo();

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 20);
		window.addEventListener("scroll", onScroll);
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	const handleGetStarted = () => {
		if (user) {
			if (user.role === "ACCOMMODATION_OWNER" && ownerInfo) {
				navigate("/owner/home");
			} else {
				navigate("/owner/onboard");
			}
		} else {
			navigate("/owner/register");
		}
	};

	const handleSignIn = () => {
		openModal(
			<LoginModal
				onLoginSuccess={() => {
					closeModal();
					navigate("/owner/onboard");
				}}
			/>
		);
	};

	return (
		<>
			<Box
				component="header"
				sx={{
					position: "fixed",
					top: 0,
					left: 0,
					right: 0,
					zIndex: 1200,
					transition: "all 0.3s ease",
					background: scrolled ? "rgba(8,13,26,0.85)" : "transparent",
					backdropFilter: scrolled ? "blur(20px)" : "none",
					borderBottom: scrolled ? "1px solid rgba(255,255,255,0.07)" : "1px solid transparent",
					boxShadow: scrolled ? "0 4px 32px rgba(0,0,0,0.3)" : "none",
				}}
			>
				<Container maxWidth="lg">
					<Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ height: 72 }}>
						<Stack direction="row" alignItems="center" spacing={1.5} sx={{ cursor: "pointer", userSelect: "none" }} onClick={() => navigate("/")}>
							<Box
								sx={{
									width: 36,
									height: 36,
									borderRadius: 2,
									background: "linear-gradient(135deg, #f5a623, #e8942a)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									boxShadow: "0 4px 16px rgba(245,166,35,0.35)",
									flexShrink: 0,
								}}
							>
								<AddHomeWorkRoundedIcon sx={{ fontSize: 20, color: "#080d1a" }} />
							</Box>
							<Typography
								sx={{
									fontFamily: "'Sora', sans-serif",
									fontWeight: 800,
									fontSize: "1.1rem",
									color: "#fff",
									letterSpacing: "-0.02em",
								}}
							>
								Vina
								<Box component="span" sx={{ color: "primary.main" }}>
									booking
								</Box>
							</Typography>
						</Stack>

						<Stack direction="row" spacing={1} alignItems="center" sx={{ display: { xs: "none", md: "flex" } }}>
							{["Why host", "How it works", "FAQ"].map((label) => (
								<Button
									key={label}
									sx={{
										color: "rgba(255,255,255,0.55)",
										fontFamily: "'DM Sans', sans-serif",
										fontWeight: 500,
										fontSize: "0.9rem",
										px: 2,
										py: 1,
										borderRadius: 2,
										textTransform: "none",
										"&:hover": { color: "#fff", background: "rgba(255,255,255,0.05)" },
									}}
								>
									{label}
								</Button>
							))}
						</Stack>

						<Stack direction="row" spacing={1.5} alignItems="center">
							{!user && (
								<Button
									onClick={handleSignIn}
									sx={{
										color: "rgba(255,255,255,0.7)",
										fontFamily: "'Sora', sans-serif",
										fontWeight: 600,
										fontSize: "0.875rem",
										px: 2.5,
										py: 1,
										borderRadius: 3,
										textTransform: "none",
										"&:hover": { color: "#fff", background: "rgba(255,255,255,0.06)" },
									}}
								>
									Sign in
								</Button>
							)}

							<Button
								onClick={handleGetStarted}
								variant="contained"
								sx={{
									background: "linear-gradient(135deg, #f5a623, #e8942a)",
									color: "#080d1a",
									fontFamily: "'Sora', sans-serif",
									fontWeight: 700,
									fontSize: "0.875rem",
									px: 2.5,
									py: 1,
									borderRadius: 3,
									textTransform: "none",
									boxShadow: "0 4px 16px rgba(245,166,35,0.3)",
									"&:hover": {
										background: "linear-gradient(135deg, #f7b73a, #f5a623)",
										boxShadow: "0 6px 24px rgba(245,166,35,0.45)",
										transform: "translateY(-1px)",
									},
								}}
							>
								{/* Dynamic text: Handles full owner, logged-in user, and guest states */}
								{user ? (user.role === "ACCOMMODATION_OWNER" && ownerInfo ? "Go to Dashboard" : "Continue Setup") : "Get started"}
							</Button>
						</Stack>
					</Stack>
				</Container>
			</Box>
		</>
	);
};

export default OwnerLandingHeader;
