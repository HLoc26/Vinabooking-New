import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import bookingApi from "../services/bookingApi";
import { authStorage } from "../../../features/auth/utils/authStorage";
import type { RootState } from "../../../app/store";

const useUserBookingDetail = (bookingId: string) => {
	const userFromRedux = useSelector((state: RootState) => state.auth.user);
	const userId = userFromRedux?.id || authStorage.getUserSync()?.id;

	const {
		data: booking,
		isLoading,
		isSuccess,
		isError,
	} = useQuery({
		queryKey: ["booking", "detail", bookingId],
		queryFn: async () => {
			const res = await bookingApi.getById(bookingId);
			return res.data || null;
		},
		enabled: !!userId && !!bookingId,
		retry: 1,
		staleTime: 1000 * 60 * 5,
	});

	const loading = isLoading && !!userId;
	const initialized = isSuccess || isError;

	return {
		booking: booking || null,
		loading,
		initialized,
	};
};

export default useUserBookingDetail;
