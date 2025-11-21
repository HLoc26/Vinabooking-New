// hooks/useAccommodationTypeNavigation.ts
import { useNavigate } from "react-router-dom";

export function useAccommodationTypeNavigation() {
	const navigate = useNavigate();

	const goToType = (type: string) => {
		navigate(`/search/${type}`);
	};
	// Force scroll to top after navigation
	window.scrollTo(0, 0);
	// OR use the modern smooth version:
	// window.scrollTo({ top: 0, behavior: "smooth" });
	return { goToType };
}
