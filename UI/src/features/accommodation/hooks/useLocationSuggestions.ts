import { useQuery } from "@tanstack/react-query";
import { useDebounce } from "../../../hooks/useDebounce";
import { search } from "../accommodationApi";

export const useLocationSuggestions = (keyword: string) => {
	const debouncedKeyword = useDebounce(keyword, 300);

	return useQuery({
		queryKey: ["accommodation", "suggestions", debouncedKeyword],

		// 3. Hàm gọi API
		queryFn: async () => {
			const res = await search({ keyword: debouncedKeyword });
			if (!res)
				return {
					data: [],
					meta: {
						total: 0,
						page: 0,
						totalPages: 0,
					},
				};
			return res.data;
		},
		enabled: debouncedKeyword.trim().length > 1, // only run if keyword > 1
		staleTime: 1000 * 60 * 5, // 5mins
		placeholderData: (prev) => prev,
	});
};
