import { useEffect, useState } from "react";
import accommodationApi from "../services/accommodationApi";
import type { AccommodationListItem } from "../types/Response";

const useTypeahead = (keyword: string) => {
	const [results, setResults] = useState<AccommodationListItem[]>([]);

	const [loading, setLoading] = useState<boolean>(false);

	useEffect(() => {
		if (!keyword) return;

		(async () => {
			setLoading(true);
			try {
				const res = await accommodationApi.search({ keyword });
				if (!res.data) {
					return;
				}
				setResults(res.data.data);
			} catch (error) {
				console.error(error);
			} finally {
				setLoading(false);
			}
		})();
	}, [keyword]);

	return { results, loading };
};

export default useTypeahead;
