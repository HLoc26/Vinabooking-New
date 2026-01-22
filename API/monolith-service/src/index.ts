import express from "express";
import type { Express } from "express";
import AppRouter from "@routes/index.routes";

const app: Express = express();

app.use(new AppRouter().router);

app.listen(8080, () => {
	console.log("Listening on port 8080");
});
