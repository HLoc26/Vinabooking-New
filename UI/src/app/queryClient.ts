import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			staleTime: 1000 * 10, // 10s
			refetchOnWindowFocus: false,
		},
		mutations: {
			retry: 3,
		},
	},
});

export default queryClient;
