import { useState, useEffect, useRef } from "react";

export const useSticky = (offset = 0) => {
	const sentinelRef = useRef<HTMLDivElement | null>(null);
	const [sticky, setSticky] = useState(false);

	useEffect(() => {
		const element = sentinelRef.current;
		if (!element) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.boundingClientRect.y < 0) {
					setSticky(!entry.isIntersecting);
				}
			},
			{
				threshold: 0,
				rootMargin: `-${offset}px 0px 0px 0px`, // Offset để chỉnh điểm kích hoạt
			}
		);

		observer.observe(element);

		return () => {
			if (element) observer.unobserve(element);
		};
	}, [offset]);

	return { sentinelRef, sticky };
};
