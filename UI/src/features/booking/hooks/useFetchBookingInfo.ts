import { useEffect, useState } from "react";
import type { BookingDto } from "../types/BookingDto";
import { bookingApi } from "../services/bookingApi";

export const useFetchBookingInfo = (bookingId: string) => {
  const [data, setData] = useState<BookingDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await bookingApi.getBooking(bookingId);
        setData(result);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [bookingId]);

  return { data, loading };
};
