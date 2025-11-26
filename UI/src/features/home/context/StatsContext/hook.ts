import { useContext } from "react";
import StatsContext from "./context";

export const useStats = () => {
	const ctx = useContext(StatsContext);
	if (!ctx) throw new Error("useStats must be used inside StatsProvider");
	return ctx;
};
