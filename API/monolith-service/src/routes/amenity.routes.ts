import { Router } from "express";
import AmenityController from "../controllers/amenity.controller";

//Base route: /amenities
class AmenityRouter {
	readonly #amenityController: AmenityController;
	constructor(
		public router: Router,
		amenityController: AmenityController
	) {
		this.#amenityController = amenityController;
		this.registerRoutes();
	}

	private registerRoutes() {
		this.router.get("/", (req, res) => {
			return this.#amenityController.getAll(req, res);
		});
	}
}

export default AmenityRouter;
