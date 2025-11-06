import express from "express";
import ErrorHandler from "./middlewares/ErrorHandler";
import EmailRouterFactory from "./routes/EmailRouterFactory";
const app = express();
app.use(express.json());

// Base route: /users
app.use("/", EmailRouterFactory.createEmailRouter());

app.use(ErrorHandler.handle);

const PORT = process.env["PORT"] || 3008;
app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));
