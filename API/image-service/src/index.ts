import express from "express";
import ImageRouter from "./routes/ImageRouter";
import ErrorHandler from "./middlewares/ErrorHandler";
import { setupSwagger } from "./configs/swagger";
const app = express();
app.use(express.json());

// Base route: /image

setupSwagger(app);

app.use(new ImageRouter().router);

app.use(ErrorHandler.handle);

const PORT = process.env["PORT"] || 3007;
app.listen(PORT, () => console.log(`Image Service running on port ${PORT}`));
