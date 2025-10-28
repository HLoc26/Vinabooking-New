// src/features/booking/hooks/useConfirmBooking.ts
import { useState } from "react";
import { bookingApi } from "../services/bookingApi";
import type { BookingDto } from "../types/BookingDto";

export function useConfirmBooking() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

const confirmBooking = async (booking: BookingDto) => {
  try {
    const response = await bookingApi.createBooking(booking);
    console.log("Booking created:", response);
  } catch (err) {
    console.error("Error confirming booking:", err);
  }
};


  return { confirmBooking, loading, error };
}
