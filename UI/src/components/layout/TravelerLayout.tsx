import React, { type ReactNode } from "react";
import Container from "@mui/material/Container";
import CssBaseline from "@mui/material/CssBaseline";
import NavigationBar from "../ui/NavigationBar";
import Footer from "../ui/Footer";

type TravelerLayoutProps = {
	children: ReactNode;
};

export const TravelerLayout: React.FC<TravelerLayoutProps> = ({ children }) => {
	return (
		<>
			<CssBaseline />
			<NavigationBar />

			{/* Main content */}
			<Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
				{children}
			</Container>

			{/* Footer */}
			<Footer />
		</>
	);
};
