import { useEffect, useState } from "react";
import type { Booking } from "../types/Booking";
import bookingApi from "../services/bookingApi";
import type { UserDto } from "../../../types/UserDto";
import useAuthContextProvider from "../../../context/AuthContext/hook";

const useUserBookingDetail = (bookingId: string) => {
	const { getCurrentUser } = useAuthContextProvider();
	const [user, setUser] = useState<UserDto | null>(null);

	useEffect(() => {
		const loggedIn = getCurrentUser();
		setUser(loggedIn);
	}, [getCurrentUser]);

	const [booking, setBooking] = useState<Booking | null>(null);

	useEffect(() => {
		let isMounted = true;

		(async () => {
			try {
				if (!user?.id) return;
				if (!bookingId) return;

				const res = await bookingApi.getById(bookingId);

				console.log(res);
				if (!res.data) {
					setBooking(null);
					return;
				}

				if (isMounted) setBooking(res.data);
			} catch (e: unknown) {
				console.log(e);
				if (isMounted) setBooking(null);
			}
		})();

		return () => {
			isMounted = false;
		};
	}, [user?.id, bookingId]);

	return booking;
};

export default useUserBookingDetail;
