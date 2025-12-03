import express from "express";
import cors from "cors";
import roomRoutes from "./routes/room.routes";
import { errorMiddleware } from "./middlewares/error.middleware";

const app = express();

// === Base middlewares ===
app.use(cors()); // Cross-origin
app.use(express.json()); // Parse JSON bodies

// === Health check ===
app.get("/health", (_, res) => {
	res.json({ service: "Room Service", success: true });
});

// === API Routes ===
app.use("/", roomRoutes);

// === Error handler ===
app.use(errorMiddleware);

export default app;
