import express from "express";
import cors from "cors";
import accommodationRoutes from "./routes/accommodation.routes";
//import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

// Base middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use("/", accommodationRoutes);

// Health check
app.get("/health", (_, res) => {
    res.json({ service: "Accommodation Service", success: true });
});

// Global error handling
//app.use(errorMiddleware);

export default app;
