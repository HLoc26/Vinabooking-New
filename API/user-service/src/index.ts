import express from "express";
import UserRouter from "./routes/user.routes.ts";
import ErrorHandler from "./middlewares/ErrorHandler.ts";
const app = express();
app.use(express.json());

// Base route: /users
app.use("/", new UserRouter().router);

app.use(ErrorHandler.handle);

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => console.log(`User Service running on port ${PORT}`));
