import React, { type ReactNode } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import NavigationBar from "./NavigationBar";
import Footer from "./Footer";

type TravelerLayoutProps = {
	children: ReactNode;
};

export const TravelerLayout: React.FC<TravelerLayoutProps> = ({ children }) => {
	return (
		<>
			<CssBaseline />
			<NavigationBar />

			{/* Main content */}
			{children}

			{/* Footer */}
			<Footer />
		</>
	);
};
