import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import accommodationRouter from "./routes/accommodation.route.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use("/", accommodationRouter);

export { app };