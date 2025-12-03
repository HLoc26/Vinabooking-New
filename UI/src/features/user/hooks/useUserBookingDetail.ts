import { useEffect, useState } from "react";
import type { Booking } from "../types/Booking";
import bookingApi from "../services/bookingApi";
import type { UserDto } from "../../../types/UserDto";
import useAuthContextProvider from "../../../context/AuthContext/hook";

const useUserBookingDetail = (bookingId: string) => {
	const { getCurrentUser } = useAuthContextProvider();
	const [user, setUser] = useState<UserDto | null>(null);
	const [booking, setBooking] = useState<Booking | null>(null);
	const [loading, setLoading] = useState<boolean>(true);
	const [initialized, setInitialized] = useState(false);

	useEffect(() => {
		const loggedIn = getCurrentUser();
		setUser(loggedIn);
	}, [getCurrentUser]);

	useEffect(() => {
		let isMounted = true;

		(async () => {
			if (!user?.id || !bookingId) return;

			setLoading(true);
			try {
				const res = await bookingApi.getById(bookingId);
				if (!res.data) {
					if (isMounted) setBooking(null);
				} else {
					if (isMounted) setBooking(res.data);
				}
			} catch (e) {
				console.log(e);
				if (isMounted) setBooking(null);
			} finally {
				if (isMounted) {
					setLoading(false);
					setInitialized(true);
				}
			}
		})();

		return () => {
			isMounted = false;
		};
	}, [user?.id, bookingId]);

	return { booking, loading, initialized };
};

export default useUserBookingDetail;
