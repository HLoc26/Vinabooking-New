import express from "express";
import AuthRouter from "./routes/auth.routes.ts";
const app = express();
app.use(express.json());

app.use("/", new AuthRouter().router);

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Auth Service running on port ${PORT}`));
