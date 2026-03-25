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
	const navigate = useNavigate();

	const user = useSelector((state: RootState) => state.auth.user);
	const { data: ownerInfo } = useOwnerInfo();

	useEffect(() => {
		// Redirect fully onboarded owners directly to their dashboard
		if (user?.role === "ACCOMMODATION_OWNER" && ownerInfo) {
			navigate("/owner/dashboard");
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
	}, [navigate, ownerInfo, user]);

	const handleGetStarted = () => {
		if (user) {
			if (user.role === "ACCOMMODATION_OWNER" && ownerInfo) {
				navigate("/owner/dashboard");
			} else {
				navigate("/owner/onboard");
			}
		} else {
			openModal(
				<LoginModal
					onLoginSuccess={() => {
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
