import { useEffect, useState } from "react";
import type { Accommodation } from "../types/Accommodation";
import accommodationApi from "../services/accommodationApi";

const useTypeahead = (keyword: string) => {
	const [results, setResults] = useState<Accommodation[]>([]);

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
