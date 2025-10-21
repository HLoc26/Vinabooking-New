import express from "express";
import cors from "cors";
import roomRoutes from "./routes/room.routes";

const app = express();

// Base middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", (_, res) => {
    res.json({ service: "Room Service", success: true });
});

// Routes
app.use("/", roomRoutes);

export default app;
