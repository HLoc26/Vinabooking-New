import express from "express";
import cors from "cors";
import accommodationRoutes from "./routes/accommodation.routes";
import facilityRoutes from "./routes/facility.routes";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

// Base middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_, res) => {
	res.json({ service: "Accommodation Service", success: true });
});

// Routes
app.use("/", facilityRoutes);
app.use("/", accommodationRoutes);

// Global error handling
app.use(errorMiddleware);

export default app;
