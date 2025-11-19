import dotenv from "dotenv";
import express from "express";
import proxy from "express-http-proxy";
import cors from "cors";
dotenv.config({ path: ["../common.env", ".env"] });

const app = express();
app.use(express.json());

app.use(
	cors({
		origin: "http://localhost:5173", // hoặc '*' nếu đang dev
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	})
);

// Middleware check auth cho tất cả request
app.use((req, res, next) => {
	console.log(`Incoming request: ${req.method} ${req.url}`);
	next();
});

app.get("/health", (req, res) => {
	res.json({ service: "API Gateway", success: true });
});

app.use("/accommodations", proxy(process.env.ACCOMMODATION_ENDPOINT));
app.use("/auth", proxy(process.env.AUTH_ENDPOINT));
app.use("/bookings", proxy(process.env.BOOKING_ENDPOINT));
app.use("/reviews", proxy(process.env.REVIEW_ENDPOINT));
app.use("/rooms", proxy(process.env.ROOM_ENDPOINT));
app.use("/users", proxy(process.env.USER_ENDPOINT));
app.use(
	"/images",
	proxy(process.env.IMAGE_ENDPOINT, {
		limit: "50mb",
	})
);
app.use("/email", proxy(process.env.EMAIL_ENDPOINT));

app.listen(3000, () => console.log("API Gateway running on port 3000"));
