import React, { type ReactNode } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import NavigationBar from "../ui/NavigationBar";
import Footer from "../ui/Footer";
import { Container } from "@mui/material";

type TravelerLayoutProps = {
	children: ReactNode;
};

export const TravelerLayout: React.FC<TravelerLayoutProps> = ({ children }) => {
	return (
		<>
			<CssBaseline />
			<NavigationBar />

			{/* Main content */}
			<Container>{children}</Container>

			{/* Footer */}
			<Footer />
		</>
	);
};
