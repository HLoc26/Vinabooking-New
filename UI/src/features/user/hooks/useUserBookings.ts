import { useEffect, useState } from "react";
import type { Booking } from "../types/Booking";
import bookingApi from "../services/bookingApi";
import type { UserDto } from "../../../types/UserDto";
import useAuthContextProvider from "../../../context/AuthContext/hook";

const useUserBookings = () => {
	const { getCurrentUser } = useAuthContextProvider();
	const [user, setUser] = useState<UserDto | null>(null);

	useEffect(() => {
		const loggedIn = getCurrentUser();
		setUser(loggedIn);
	}, [getCurrentUser]);
	const [booking, setBooking] = useState<Booking[]>([]);

	useEffect(() => {
		let isMounted = true;

		(async () => {
			try {
				if (!user?.id) return;
				const res = await bookingApi.getByUserId(user.id);

				if (!res.data) {
					setBooking([]);
					return;
				}

				if (isMounted) setBooking(res.data);
			} catch (e: unknown) {
				console.log(e);
				if (isMounted) setBooking([]);
			}
		})();

		return () => {
			isMounted = false;
		};
	}, [user?.id]);

	return booking;
};

export default useUserBookings;
