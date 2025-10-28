// src/features/booking/hooks/useConfirmBooking.ts
import { useState } from "react";
import { bookingApi } from "../services/bookingApi";
import type { BookingDto } from "../types/BookingDto";

export function useConfirmBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const confirmBooking = async (booking: BookingDto) => {
    setLoading(true);
    setError(null);
    try {
      const result = await bookingApi.createBooking(booking);
      return result;
    } catch (err: any) {
      console.error("Error confirming booking:", err);
      setError(err.message ?? "Unknown error");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { confirmBooking, loading, error };
}
