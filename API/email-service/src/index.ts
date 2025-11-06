import express from "express";
import ErrorHandler from "./middlewares/ErrorHandler";
import EmailRouterFactory from "./routes/EmailRouterFactory";
import { setupSwagger } from "./config/swagger";
const app = express();
app.use(express.json());

setupSwagger(app);

// Base route: /users
app.use(EmailRouterFactory.createEmailRouter());

app.use(ErrorHandler.handle);

const PORT = process.env["PORT"] || 3008;
app.listen(PORT, () => console.log(`Email Service running on port ${PORT}`));
