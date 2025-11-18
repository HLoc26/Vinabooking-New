import express, { Express } from "express";
import ErrorHandler from "./middlewares/ErrorHandler";
import EmailRouterFactory from "./routes/EmailRouterFactory";
import { setupSwagger } from "./config/swagger";

class RestServer {
	private app: Express;
	private readonly port: number;

	constructor() {
		this.app = express();
		this.port = Number(process.env["PORT"]) || 3008;
		this.initializeMiddlewares();
		this.initializeRoutes();
		this.initializeErrorHandler();
		this.initializeSwagger();
	}

	private initializeMiddlewares() {
		this.app.use(express.json());
	}

	private initializeRoutes() {
		// Base route: /email
		this.app.use(EmailRouterFactory.createEmailRouter());
	}

	private initializeErrorHandler() {
		this.app.use(ErrorHandler.handle);
	}

	private initializeSwagger() {
		setupSwagger(this.app);
	}

	public start() {
		this.app.listen(this.port, () => console.log(`Email REST service running on port ${this.port}`));
	}
}

export default RestServer;
