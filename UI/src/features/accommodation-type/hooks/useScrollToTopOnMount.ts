//Force page refresh when first visit it
import { useEffect } from "react";

/**
 * A custom React hook that scrolls the page to the top on initial component mount.
 * Useful for ensuring the page starts at the top when first loaded.
 */
export const useScrollToTopOnMount = () => {
	useEffect(() => {
		// Scroll to top instantly
		window.scrollTo(0, 0);
		// Or smoothly: window.scrollTo({ top: 0, behavior: 'smooth' });
	}, []); // Empty dependency array: runs only once on mount
};
