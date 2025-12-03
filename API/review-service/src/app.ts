import express from "express";
import ReviewRouterFactory from "./routes/ReviewRouter";
import ErrorHandler from "./middlewares/ErrorHandler";

const app = express();

const reviewRouter = ReviewRouterFactory.createReviewRouter();

app.use(express.json());

app.use("/", reviewRouter);

app.use(ErrorHandler.handle);

export default app;
