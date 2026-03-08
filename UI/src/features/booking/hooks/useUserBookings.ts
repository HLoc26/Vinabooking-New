import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import { authStorage } from "../../auth/utils/authStorage";
import type { RootState } from "../../../app/store";
import { bookingApi } from "../services/bookingApi";

const useUserBookings = () => {
	const userFromRedux = useSelector((state: RootState) => state.auth.user);
	const userId = userFromRedux?.id || authStorage.getUserSync()?.id;

	const { data: bookings = [] } = useQuery({
		queryKey: ["bookings", "user", userId],
		queryFn: async () => {
			if (!userId) return [];
			const res = await bookingApi.getByUserId(userId);
			return res.data || [];
		},
		enabled: !!userId,
		staleTime: 1000 * 60 * 5,
		refetchOnWindowFocus: false,
	});

	return bookings;
};

export default useUserBookings;
