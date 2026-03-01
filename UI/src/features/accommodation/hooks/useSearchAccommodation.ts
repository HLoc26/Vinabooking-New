import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { parseSearchParamsToQuery } from "../../../utils/search";
import { useQuery } from "@tanstack/react-query";
import { search } from "../accommodationApi";

export const useSearchAccommodations = () => {
	const [searchParams] = useSearchParams();

	const queryCriteria = useMemo(() => parseSearchParamsToQuery(searchParams), [searchParams]);
	return useQuery({
		queryKey: ["accommodation", "search", queryCriteria],
		queryFn: async () => {
			const res = await search(queryCriteria);
			if (!res)
				return {
					data: [],
					meta: {
						total: 0,
						limit: queryCriteria.pagination.limit,
						page: 0,
						totalPages: 0,
					},
				};
			return res.data;
		},
		staleTime: 1000 * 60 * 5, // 5mins
		placeholderData: (prev) => prev,
	});
};
