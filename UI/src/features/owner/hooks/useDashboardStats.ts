import { useQuery } from "@tanstack/react-query";
import { getDashboardStats } from "../services/ownerApi";

export const useDashboardStats = () => {
	return useQuery({
		queryKey: ["ownerDashboardStats"],
		queryFn: getDashboardStats,
		staleTime: 5 * 60 * 1000, // Cache 5 phút để chuyển tab không bị giật/gọi lại API
		retry: 2,
	});
};
