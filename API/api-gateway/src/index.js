import dotenv from "dotenv";
import express from "express";
import proxy from "express-http-proxy";
import cors from "cors";
dotenv.config({ path: ["../common.env", ".env"] });

const proxyHeaderOptions = {
	proxyReqOptDecorator: (proxyReqOpts, srcReq) => {
		if (srcReq.headers.authorization) {
			proxyReqOpts.headers["Authorization"] = srcReq.headers.authorization;
		}
		return proxyReqOpts;
	},
	userResHeaderDecorator: (headers) => {
		headers["Access-Control-Allow-Origin"] = "http://localhost:5173";
		headers["Access-Control-Allow-Credentials"] = "true";
		headers["Access-Control-Allow-Headers"] = "Content-Type,Authorization";
		return headers;
	},
	proxyErrorHandler: (err, res, _next) => {
		console.error(`[Gateway] Proxy error: ${err.message}`);
		res.status(502).json({ success: false, message: "Service unavailable" });
	},
};

const app = express();

const CLIENT = "http://localhost:5173";

app.use(
	cors({
		origin: CLIENT, // hoặc '*' nếu đang dev
		methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
		allowedHeaders: ["Content-Type", "Authorization"],
		credentials: true,
	})
);
app.use(express.json());

// Middleware check auth cho tất cả request
app.use((req, res, next) => {
	console.log(`Incoming request: ${req.method} ${req.url}`);
	next();
});

app.get("/health", (req, res) => {
	res.json({ service: "API Gateway", success: true });
});

app.use("/accommodations", proxy(process.env.ACCOMMODATION_ENDPOINT, proxyHeaderOptions));
app.use("/auth", proxy(process.env.AUTH_ENDPOINT, proxyHeaderOptions));
app.use("/bookings", proxy(process.env.BOOKING_ENDPOINT, proxyHeaderOptions));
app.use("/reviews", proxy(process.env.REVIEW_ENDPOINT, proxyHeaderOptions));
app.use("/rooms", proxy(process.env.ROOM_ENDPOINT, proxyHeaderOptions));
app.use("/users", proxy(process.env.USER_ENDPOINT, proxyHeaderOptions));
app.use(
	"/images",
	proxy(process.env.IMAGE_ENDPOINT, {
		limit: "50mb",
		...proxyHeaderOptions,
	})
);
app.use("/email", proxy(process.env.EMAIL_ENDPOINT, proxyHeaderOptions));

app.listen(3000, () => console.log("API Gateway running on port 3000"));
