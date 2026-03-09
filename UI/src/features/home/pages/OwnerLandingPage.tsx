import React, { useEffect, useState } from "react";
import { Box } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../../../app/store";

import OwnerLandingHeader from "../components/owner/OwnerLandingHeader";
import useModalContext from "../../../context/ModalContext/hook";
import LoginModal from "../../../components/shared/LoginModal";
import { ACCOMMODATION_DEFAULT_IMAGES } from "../../accommodation/types/const";

import HeroSection from "../components/owner/sections/HeroSection";
import WhyHostSection from "../components/owner/sections/WhyHostSection";
import ProcessSection from "../components/owner/sections/ProcessSection";
import FaqSection from "../components/owner/sections/FaqSection";
import BottomCtaSection from "../components/owner/sections/BottomCtaSection";
import { useOwnerInfo } from "../../owner/hooks/useOwnerInfo";

const OwnerLandingPage: React.FC = () => {
	const [scrollY, setScrollY] = useState(0);
	const { openModal, closeModal } = useModalContext();

	// Initialize navigation hook and retrieve user state
	const navigate = useNavigate();

	const { data: ownerInfo } = useOwnerInfo();

	const user = useSelector((state: RootState) => state.auth.user);

	useEffect(() => {
		if (ownerInfo) {
			navigate("/owner/home");
			return;
		}
		// Inject Google Fonts for the landing page
		const link = document.createElement("link");
		link.href = "https://fonts.googleapis.com/css2?family=Sora:wght@300;400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap";
		link.rel = "stylesheet";
		document.head.appendChild(link);

		const onScroll = () => setScrollY(window.scrollY);
		window.addEventListener("scroll", onScroll);

		return () => window.removeEventListener("scroll", onScroll);
	}, [navigate, ownerInfo]);

	const handleGetStarted = () => {
		if (user) {
			// 1. User is logged in (default role is Traveler) -> Redirect directly to business onboarding
			navigate("/owner/onboard");
		} else {
			// 2. User is not logged in -> Open Login Modal
			openModal(
				<LoginModal
					onLoginSuccess={() => {
						// After successful login/registration, close modal and redirect to onboarding
						closeModal();
						navigate("/owner/onboard");
					}}
				/>
			);
		}
	};

	const exampleImage = ACCOMMODATION_DEFAULT_IMAGES["ALL"]!;

	return (
		<Box
			sx={{
				bgcolor: "background.default",
				color: "text.primary",
				minHeight: "100vh",
				"@keyframes fadeUp": {
					from: { opacity: 0, transform: "translateY(28px)" },
					to: { opacity: 1, transform: "translateY(0)" },
				},
				"@keyframes float": {
					"0%,100%": { transform: "translateY(0)" },
					"50%": { transform: "translateY(-10px)" },
				},
			}}
		>
			<OwnerLandingHeader />

			<HeroSection scrollY={scrollY} onGetStarted={handleGetStarted} exampleImage={exampleImage} />

			<WhyHostSection />

			<ProcessSection />

			<FaqSection />

			<BottomCtaSection onGetStarted={handleGetStarted} />
		</Box>
	);
};

export default OwnerLandingPage;
