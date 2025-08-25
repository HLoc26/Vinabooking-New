import express from "express";
import AuthRouter from "./routes/UserRouter.ts";
import session from "express-session";

import "dotenv";
import ErrorHandler from "./middlewares/ErrorHandler.ts";

const app = express();
app.use(express.json());

app.use(
    session({
        secret: process.env["SESSION_SECRET"] as string,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false },
    })
);

app.use("/", new AuthRouter().router);

app.use(ErrorHandler.handle);

const PORT = process.env["PORT"] || 3002;
app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));
