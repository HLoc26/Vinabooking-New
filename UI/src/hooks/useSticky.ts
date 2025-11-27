import { useState, useEffect, useRef } from "react";

export const useSticky = (offset = 0) => {
	const ref = useRef<HTMLDivElement | null>(null);
	const [sticky, setSticky] = useState(false);

	useEffect(() => {
		if (!ref.current) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				setSticky(!entry.isIntersecting);
			},
			{
				threshold: 0,
				rootMargin: `-${offset}px 0px 0px 0px`,
			}
		);

		observer.observe(ref.current);
		return () => observer.disconnect();
	}, [offset]);

	return { ref, sticky };
};
