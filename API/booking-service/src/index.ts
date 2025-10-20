import express from "express";
import BookingRouterFactory from "./routes/BookingRouter";

const app = express();
app.use(express.json());

const bookingRouter = BookingRouterFactory.createBookingRouter();
app.use("/booking", bookingRouter);

app.get("/health", (_req, res) => res.json({ service: "Booking Service", success: true }));

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Booking Service running on port ${PORT}`));
